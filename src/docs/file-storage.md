# File Storage
TODO: This document is comming soon...

```yaml:minio.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: minio

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: minio
  name: minio
spec:
  interval: 5m
  url: https://charts.min.io/

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: minio
  name: minio
spec:
  chart:
    spec:
      chart: minio
      sourceRef:
        kind: HelmRepository
        name: minio
      version: ~5.4.0
  dependsOn: []
  interval: 5m
  releaseName: minio
  upgrade:
    remediation:
      remediateLastFailure: true

  ## Secret with credentials are required for the chart to install.
  ## Either use external-secrets or this command to populate admin creds.
  ## kubectl --namespace minio create secret generic minio-admin --from-literal=username=admin --from-literal=password=$(openssl rand -hex 10)
  valuesFrom:
  - kind: Secret
    name: minio-admin
    valuesKey: username
    targetPath: rootUser

  - kind: Secret
    name: minio-admin
    valuesKey: password
    targetPath: rootPassword

  values:
    ## Ref: https://github.com/minio/minio/blob/master/helm/minio/values.yaml
    # Number of drives attached to a node
    drivesPerNode: 1
    # Number of MinIO containers running
    replicas: 4
    # Number of expanded MinIO clusters
    pools: 1

    persistence:
      enabled: true
      
      size: 10Gi
      #storageClass: ""
      #VolumeName: ""
      #accessMode: ReadWriteOnce
    
    # Default was 16Gi
    resources:
      requests:
        memory: 512Mi

    # Using this label for topologySpreadConstraints below
    podLabels:
      pool-name: minio-pool-01

    # Pod placement rules
    nodeSelector: {}
    tolerations: []
    affinity: {}
    topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: kubernetes.io/hostname
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          pool-name: minio-pool-01

```
