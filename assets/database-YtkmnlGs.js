const e=`# Database
We recommend [YugabyteDB](https://www.yugabyte.com/) since it is a Postgres compatible distributed database.
It replicates and distributes data automatically.
This simplifies horizontal scalability and high-availability problems that come with generic Postgres or MySQL/MariaDB.
The system also doesn't suffer from manual maintenance tasks like having to run vacuum and locking tables while waiting for it to complete, compaction is just automagic.

\`\`\`yaml:yugabyte.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: database-system

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: database-system
  name: yugabyte
spec:
  interval: 5m
  url: https://charts.yugabyte.com

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: database-system
  name: yugabyte
spec:
  chart:
    spec:
      chart: yugabyte
      sourceRef:
        kind: HelmRepository
        name: yugabyte
      version: ~2025.1.0
  dependsOn: []
  interval: 5m
  releaseName: yugabyte
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
    replicas:
      master: 3
      tserver: 3
      ## Used to set replication factor when isMultiAz is set to true
      totalMasters: 3
\`\`\`

After Yugabyte is installed, you can access it via the cli.
\`\`\`bash
kubectl -n database-system exec -it yb-tserver-0 -- ysqlsh -U yugabyte
\`\`\`

If you would like to access it locally, you can expose the service with port forwarding.
\`\`\`bash
kubectl -n database-system port-forward svc/yb-tserver-service 5433:5433
\`\`\``;export{e as default};
