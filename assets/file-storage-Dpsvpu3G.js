const n=`# File Storage
TODO: This document is comming soon...

\`\`\`yaml:minio.yaml
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
\`\`\`

## Accessing Minio
Get the admin credentials.
\`\`\`bash
% kubectl -n minio get secret minio -o yaml | yq '.data | with_entries(.value |= @base64d)'  
rootPassword: Nenz80E1TiK4AhZ4cqt0WX4wcxJYAp5ScSCNs3Hh
rootUser: ukIW4Z60OPtYgiTxeRwJ
\`\`\`

Start a port-forward with kubectl as shown below and go to \`http://localhost:9001\` in your browser.
\`\`\`bash
kubectl -n minio port-forward svc/minio-console 9001:9001
\`\`\`

# Exposing Buckets
TODO: Create this section.`;export{n as default};
