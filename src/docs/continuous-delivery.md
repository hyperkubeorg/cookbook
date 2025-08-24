# Continuous Delivery

This cookbook leans heavily into using GitOps with [Flux2](https://fluxcd.io/flux/).
The opinion here is that Flux2 handles the deployment of resources better than alternatives like [Argo CD](https://argo-cd.readthedocs.io/en/stable/) or [Spinnaker](https://spinnaker.io/).
With Flux2 when you deploy a helm chart through it, helm commands actually work for troubleshooting, as opposed to being stuck in some management UI.

While the deployment for Flux2 requires more work than most of the other deployment, it pays off once it is running in the cluster.

Once deployed and configured, your cluster will be manageable through git commits and rollbacks become a matter of pulling prior values from the commit history.

## Preparation
Create a new repo, this is where you will manage your deployments from.

Ensure you have a dedicated SSH key for this new repo.
In the past, issues with ECDSA keys have been observed.
```bash
ssh-keygen -t rsa -b 4096 -C gitops -f ~/.ssh/gitops -N ''
```

The new public key will be available at `~/.ssh/gitops.pub`.
Configure your gitops repo to use the new public key.

## Deployment Instructions

Take a moment to identify the latest version of Flux2 with the following command.
```bash
curl -s https://fluxcd-community.github.io/helm-charts/index.yaml | yq '.entries.flux2 | .[].version' | sort -V | tail
```

Use helm to install Flux2.
```bash
helm --namespace flux-system upgrade flux2 flux2 --install --create-namespace --version '~2.16.0' --repo https://fluxcd-community.github.io/helm-charts --wait
```

With the flux command, create a new source referencing the new repo and private key.
```bash
flux --namespace flux-system create source git gitops --branch main --url ssh://git@github.com/ORG-OR-USER/REPO_NAME.git --private-key-file ~/.ssh/gitops -s
```

Create a Kustomization resource.
This configures Flux2 to start using the new repo for deployments.
Be sure to make updates, some example data is included in this setup for convenience.
This entire block is designed to be pasted into a terminal.
```bash
cat <<-'EOF' | kubectl -n flux-system apply -f -
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: gitops
spec:
  interval: 10m
  ## Note: is this secure?
  # targetNamespace: default
  sourceRef:
    kind: GitRepository
    name: gitops
  path: "." # Change this to the directory path if you don't want to deploy everything in the root of the repo
  prune: true
  timeout: 1m
  postBuild:
    # example variable using substitute
    substitute:
      foo: bar
    substituteFrom:
      # example variables from a ConfigMap
      - kind: ConfigMap
        name: gitops-vars
        optional: true
      # example variables from a Secret
      - kind: Secret
        name: gitops-secret-vars
        optional: true

---
apiVersion: v1
kind: Secret
metadata:
  name: gitops-secret-vars
stringData:
  EXAMPLE_API_KEY: my-key-goes-here
  INGRESS_EXTERNAL_DNS_HOSTNAME: "*.mysite.tld,mysite.tld"

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: gitops-vars
data:
  cfgfoo: cfgbar
EOF
```

In the example above, you have some variables that are configured.
These are variables that can directly referenced in the manifests you place in your repo.

Here is a test manifest to start with:
```yaml:examples.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: my-awesome-namespace

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-awesome-configmap
  namespace: my-awesome-namespace
data:
  not-a-secret-anymore: "${EXAMPLE_API_KEY}"
```

## Reconciling
While debugging, you will often need to reconcile Flux2 resources. 
This can force Flux2 to retry something that has previously failed, or you could just do this to speed up a deployment.

The following example shows how to reconcile the gitops repo specifically.
```bash
flux -n flux-system reconcile source git gitops
flux -n flux-system reconcile kustomization gitops
```

Most of the Flux2 resource types can be reconciled.
The order in which you reconcile matters.
As in the example above, the git source is reconciled before the kustomization to ensure all the new repo changes are observed.

## How to do CI/CD with Flux2
TODO: This needs further instructions outlined.

Flux2 has a lot of automation built in for tracking container updates.
For now, this cookbook has to send you off to the [Flux2 Documentation](https://fluxcd.io/flux/) to figure it out yourself.
The features you are lookingfor involves filtering image tags and the having Flux2 automatically update the deployed manifests when new container versions are available.

## PseudoChart - Arbitrary Object Releases
Hyperkube maintains the PseudoChart package, which is just a wrapper for arbitrary objects.
Using this opens up the ability to lock objects behind other chart dependencies.
There is some example usage in the [certificate management](certificate-management.md) document.

The package is available via ghcr.io.
```bash
helm show chart oci://ghcr.io/hyperkubeorg/pseudochart
```

And also available via gh-pages.
```bash
helm repo add hyperkubeorg https://hyperkubeorg.github.io/charts

# Update to get latest versions
helm repo update

# Search for charts in the repo
helm search repo hyperkubeorg

# Show all versions of a specific chart
helm search repo hyperkubeorg/pseudochart --versions

# Show just the latest version
helm search repo hyperkubeorg/pseudochart

# Remove the repo, because helm repo/search are bad commands missing --repo flag
helm repo rm hyperkubeorg
```