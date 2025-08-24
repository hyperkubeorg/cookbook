# Kubernetes Dashboard

This dashboard is a serious handicap that some people will want to view cluster information.
It is the most inefficient way of getting around your cluster, but you will deploy it anyways because it is easier than teaching people how to use Kubernetes.

```yaml:kubernetes-dashboard.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: kubernetes-dashboard

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: kubernetes-dashboard
  name: kubernetes-dashboard
spec:
  interval: 5m
  url: https://kubernetes.github.io/dashboard

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: kubernetes-dashboard
  name: kubernetes-dashboard
spec:
  chart:
    spec:
      chart: kubernetes-dashboard
      sourceRef:
        kind: HelmRepository
        name: kubernetes-dashboard
      version: ~7.13.0
  dependsOn: []
  interval: 5m
  releaseName: kubernetes-dashboard
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
    ## Uncommand and configure for OIDC auth
    # web:
    #   containers:
    #     env:
    #       - name: DASHBOARD_LOGIN_MODE
    #         value: "OIDC"
    #       - name: OIDC_CLIENT_ID
    #         value: "<google-client-id>"
    #       - name: OIDC_CLIENT_SECRET
    #         value: "<google-client-secret>"
    #       - name: OIDC_ISSUER_URL
    #         value: "https://accounts.google.com"
    #       - name: OIDC_SCOPE
    #         value: "openid email profile"
    #       - name: OIDC_REDIRECT_URL
    #         value: "https://your-dashboard-url/oauth2/callback"
```

## Accessing Kubernetes Dashboard
Out of the box, you have to use service accounts to access the Kubernetes dashboard.
The dashboard can be configured for 

The following configuration creates a service account that has full admin permissions.
```yaml:dashboard-admin.yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dashboard-admin-sa
  namespace: kubernetes-dashboard

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: dashboard-admin-sa
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: dashboard-admin-sa
  namespace: kubernetes-dashboard
```

Then you need to generate a token to copy/paste into the dashboard for auth.
```bash
kubectl -n kubernetes-dashboard create token dashboard-admin-sa
```

Start a port-forward with kubectl as shown below and go to `https://localhost:8443` in your browser.
You will need to bypass the self-signed certificate warning in your browser.
```bash
kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard-kong-proxy 8443:443
```
