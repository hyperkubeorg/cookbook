# Secrets Management

It is very common to want to centrally store and manage secrets in a system that can be used outside of Kubernetes.
The [external-secrets](https://external-secrets.io/) operator can synchronize secrets from various systems.
The YAML below is for deployment of just the operator.

```yaml:external-secrets.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: external-secrets

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: external-secrets
  name: external-secrets
spec:
  interval: 5m
  url: https://charts.external-secrets.io/index.yaml

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: external-secrets
  name: external-secrets
spec:
  chart:
    spec:
      chart: external-secrets
      sourceRef:
        kind: HelmRepository
        name: external-secrets
      version: ~0.19.2
  dependsOn: []
  interval: 5m
  releaseName: external-secrets
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
```

## Provider Setup
You will need to configure a Provider to pull secrets from one of any number of secret storage systems.
Documentation for this can be found on the left hand side of the page from the [fake provider](https://external-secrets.io/latest/provider/fake/).
This guide demonstrates using the fake provider because we don't want to show favor to any one system or another.

From the [continuous delivery](continuous-delivery.md) page, we show you how to map variables in the cluster for gitops manifests to consume.
The following config uses one of those variables to give you an idea of how to securely pass that around.
This specific variable should be pulled from a secret despite the erronous example of using a plain-text substitute variable here.
We also leverage the pseudochart to ensure dependency ordering.

### Cluster Scoped Secret Store
```yaml:external-secrets-cluster-provider.yaml
---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: external-secrets
  name: hyperkubeorg
spec:
  interval: 5m
  url: https://hyperkubeorg.github.io/charts

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: YOUR-APPLICATION-NAMESPACE
  name: fake-cluster-secret-store
spec:
  chart:
    spec:
      chart: pseudochart
      sourceRef:
        kind: HelmRepository
        name: hyperkubeorg
      version: ~0.2.0
  dependsOn:
  - namespace: external-secrets
    name: external-secrets
  interval: 5m
  releaseName: fake-cluster-secret-store
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
    objects:
    - apiVersion: external-secrets.io/v1
      kind: ClusterSecretStore
      metadata:
        name: fake-cluster-secret-store
      spec:
        provider:
          fake:
            data:
            - key: "/some/key/path"
              value: "${foo}"
              version: "v1"
```

### Namespace Scoped Secret Store
```yaml:external-secrets-namespaced-provider.yaml
---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: YOUR-APPLICATION-NAMESPACE
  name: hyperkubeorg
spec:
  interval: 5m
  url: https://hyperkubeorg.github.io/charts

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: YOUR-APPLICATION-NAMESPACE
  name: fake-namespaces-secret-store
spec:
  chart:
    spec:
      chart: pseudochart
      sourceRef:
        kind: HelmRepository
        name: hyperkubeorg
      version: ~0.2.0
  dependsOn:
  - namespace: external-secrets
    name: external-secrets
  interval: 5m
  releaseName: fake-namespaces-secret-store
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
    objects:
    - apiVersion: external-secrets.io/v1
      kind: SecretStore
      metadata:
        name: fake-namespaces-secret-store
      spec:
        provider:
          fake:
            data:
            - key: "/some/key/path"
              value: "${foo}"
              version: "v1"
```
