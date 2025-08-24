# Policy Enforcement
The recommendation for policy enforcement is [Kyverno](https://kyverno.io/).

## Installation
```yaml:kyverno.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: kyverno

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: kyverno
  name: kyverno
spec:
  interval: 5m
  url: https://kyverno.github.io/kyverno

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: kyverno
  name: kyverno
spec:
  chart:
    spec:
      chart: kyverno
      sourceRef:
        kind: HelmRepository
        name: kyverno
      version: ~2.5.5
  dependsOn: []
  interval: 5m
  releaseName: kyverno
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
```
