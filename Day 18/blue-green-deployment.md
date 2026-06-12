# Blue/Green Deployment

Summary of [Octopus Deploy: Blue/green deployments](https://octopus.com/devops/software-deployments/blue-green-deployment/).

## What it is

Blue/green deployment is a release strategy that runs **two identical production environments**:

- **Blue**: the environment currently serving live traffic.
- **Green**: the idle environment where the new version is deployed and tested.

Only one environment handles production traffic at a time. After the new version is validated on green, traffic is switched over. This reduces downtime and deployment risk.

## Why use it

A blue/green setup serves three roles:

1. **Staging**: while blue is live, green becomes the staging target for the next release.
2. **Rollback**: if the new version fails after switch, traffic goes back to the environment still running the old code.
3. **Disaster recovery**: after a successful release, both environments can run the same version so one acts as standby.

Common use cases:

- Zero-downtime releases for high-availability systems
- Performance benchmarking on the idle environment before go-live
- Auditable, reversible deployments for compliance-heavy industries

## How it works

1. Prepare and test the new release in staging.
2. Deploy the new version to **green** (not yet live).
3. Test green in a production-like environment without affecting users.
4. **Switch traffic** from blue to green (load balancer or DNS).
5. **Monitor** green for errors, latency, and anomalies.
6. **Rollback** to blue if critical issues appear.
7. **Cleanup**: update blue to match green, keep it as backup for the next cycle, or decommission it to save cost.

## Kubernetes

Blue/green maps well to Kubernetes:

| Resource | Role |
|----------|------|
| **Namespaces** | Isolate blue and green |
| **Deployments** | Roll out the new app version to green |
| **Services** | Point traffic at blue or green |
| **Ingress controllers** | Route external traffic between environments |
| **Prometheus / Grafana** | Monitor health after the switch |

Load balancers or a service mesh can also handle traffic routing.

## Pros

- Minimal or zero downtime during releases
- Fast rollback by redirecting traffic to the stable environment
- Full production-like testing on green before switch
- Higher deployment confidence for teams
- Better user experience (no service interruption)
- Clear, auditable process for compliance

## Cons

- **Double infrastructure cost** (two identical environments)
- **Database migrations** are harder when schema changes are not backward-compatible
- **Load balancer / DNS** misconfiguration can cause partial routing or outages
- Requires **rigorous monitoring and testing** before traffic switch
- **Larger attack surface** (two live environments to secure)
- Needs **automation**; manual steps increase error risk

## Eight best practices

1. **Automate deployments**: use CD tools to deploy, health-check, and switch traffic repeatably.
2. **Use Infrastructure as Code**: Terraform, CloudFormation, or Ansible keep blue and green identical and version-controlled.
3. **Monitor both environments**: track performance, errors, latency, and user metrics; alert on anomalies after switch.
4. **Test thoroughly on green**: unit, integration, performance, and UAT before routing live traffic.
5. **Consider gradual traffic shift**: send a small percentage to green first (similar to canary), then increase if stable.
6. **Keep database changes backward-compatible**: use expand/contract migrations, feature toggles, and rolling migrations.
7. **Plan and practice rollback**: define trigger criteria, automate revert steps, and rehearse regularly.
8. **Secure both environments equally**: patches, access controls, encryption, and audits on blue and green.

## Blue/green vs canary

- **Blue/green**: instant full traffic switch between two environments.
- **Canary / gradual shift**: slowly increase traffic to the new version to limit blast radius.

They can be combined: deploy to green (blue/green), then shift traffic gradually (canary-style).

## Key takeaway

Blue/green deployment trades **extra infrastructure** for **safer, faster releases** with near-instant rollback. It works best when deployments, health checks, traffic switching, and rollbacks are automated, and when database changes are designed to support both old and new app versions during the switch.
