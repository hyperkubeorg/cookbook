const n=`# The Toolkit
You will need the following tools to be effective at cluster operations.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Podman Desktop](https://podman-desktop.io/downloads)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [helm](https://helm.sh/docs/intro/install/)
- [kind](https://kind.sigs.k8s.io/)
- [flux](https://fluxcd.io/flux/installation/#install-the-flux-cli)
- [yq](https://github.com/mikefarah/yq)
- [jq](https://jqlang.org/) 

# Local Cluster
Using \`kind\`, you can quickly create/destroy a local Kubernetes cluster.
It can be used for testing most of the workloads you would want to run in a cluster.

Simply running \`kind create cluster\` out of the box will create a single node cluster to develop with.
This is great until you need to control what nodes workloads are deployed on with [Taints and Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/).
In production, you would want to use this functionality to ensure high-availability of your applications.

A multi-zonal cluster can be simulated with the following configuration.
\`\`\`yaml:~/.kind.yaml
---
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
  labels:
    topology.kubernetes.io/region: us-nowhere-1
    topology.kubernetes.io/zone: us-nowhere-1a
    settings.cluster.local/lvm-storage-pool: "enabled"
- role: worker
  labels:
    topology.kubernetes.io/region: us-nowhere-1
    topology.kubernetes.io/zone: us-nowhere-1b
    settings.cluster.local/lvm-storage-pool: "enabled"
- role: worker
  labels:
    topology.kubernetes.io/region: us-nowhere-1
    topology.kubernetes.io/zone: us-nowhere-1c
    settings.cluster.local/lvm-storage-pool: "enabled"
- role: worker
  labels:
    topology.kubernetes.io/region: us-nowhere-1
    topology.kubernetes.io/zone: us-nowhere-1d
\`\`\`

The kind command to initialize this cluster is as follows.
\`\`\`bash
kind create cluster --config ~/.kind.yml
\`\`\`

Maintaining an alias in your terminal config may prove worth-while for scrapping old clusters and iterating quickly.
This opens up the ability to just run \`kind-reset\` to start with a fresh cluster.
\`\`\`bash
alias kind-reset='kind delete cluster && kind create cluster --config ~/.kind.yml'
\`\`\`

Confirm the cluster is running.
\`\`\`bash
% kubectl get nodes
NAME                 STATUS   ROLES           AGE   VERSION
kind-control-plane   Ready    control-plane   10m   v1.32.0
kind-worker          Ready    <none>          10m   v1.32.0
kind-worker2         Ready    <none>          10m   v1.32.0
kind-worker3         Ready    <none>          10m   v1.32.0
kind-worker4         Ready    <none>          10m   v1.32.0
\`\`\`

From here, you can proceed with the [Continuous Delivery](continuous-delivery.md) guide.
`;export{n as default};
