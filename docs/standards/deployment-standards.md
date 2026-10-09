# Deployment Standards
## Purpose
These standards define how Technology changes are validated and promoted through environments in the Build Me project.
The goal is to make deployments predictable, safe, traceable, and reversible.
## Deployment Principle
> A feature is not ready for production simply because the code works.
Technical readiness and Product Acceptance are separate decisions.
Technology is responsible for technical readiness. Product Acceptance confirms that the product meets the required product, UX, business, and compliance expectations.
## Standard Deployment Flow
Feature
  |
  v
CI
  |
  v
Development
  |
  v
Staging
  |
  v
Product Acceptance
  |
  v
Production
## 1. Feature
Changes should be developed on an appropriate feature branch.
Before requesting promotion:
- Code is complete
- Relevant tests are created
- Relevant tests pass
- Type checking passes
- Linting and formatting pass
- Security considerations are addressed
- Required documentation is updated
## 2. CI
CI must validate the change before it is promoted.
Where applicable, CI should verify:
- Installation succeeds
- Build succeeds
- Unit tests pass
- Component tests pass
- Integration tests pass
- E2E tests pass
- Type checking passes
- Linting passes
- Security checks pass
> A failed CI quality gate must be resolved before promotion.
## 3. Development Environment
The development environment is used to validate integrated changes after they are merged into the development branch.
Verify:
- Application starts successfully
- Core functionality works
- APIs respond correctly
- Database integration works where applicable
- Relevant automated tests pass
- No critical runtime errors exist
Development must not use production secrets.
## 4. Staging Environment
Staging represents the pre-production environment.
Where applicable, staging should be used to validate:
- Production-like application behavior
- Configuration
- API integrations
- Database changes
- Authentication and authorization
- Analytics
- Performance
- Security
- Important user journeys
Staging should be as close to production as reasonably practical without exposing real production secrets or unnecessary sensitive data.
## 5. Product Acceptance
Product Acceptance is separate from Technology approval.
Technology may confirm:
> "The implementation is technically ready."
Product stakeholders must confirm that the product meets the required:
- Product expectations
- UX expectations
- Business expectations
- Compliance expectations
A technically successful deployment does not automatically mean Product Acceptance has been achieved.
## 6. Production Readiness
Before production deployment, confirm:
- CI passed
- Required automated tests passed
- Development validation completed
- Staging validation completed where applicable
- Product Acceptance completed
- Required environment variables are configured
- Security checks are complete
- Database changes are reviewed
- Analytics are verified where applicable
- Monitoring is available
- Rollback approach is understood
## 7. Production Deployment
Production deployment should only occur after all required technical and product gates are satisfied.
The deployment must:
- Use the approved production configuration
- Protect production secrets
- Apply database changes safely
- Verify application health
- Verify critical user journeys
- Monitor for deployment problems
## 8. Database Changes
Database changes must be reviewed before production.
Consider:
- Migration safety
- Backward compatibility
- Data integrity
- Existing production data
- Rollback or recovery strategy
Destructive database changes require additional review and appropriate safeguards.
## 9. Environment Variables and Secrets
Environment-specific configuration must remain separated.
Do not:
- Commit secrets to Git
- Put production secrets in development
- Share production credentials unnecessarily
- Expose secrets in logs
Use the approved deployment platform's secure environment configuration.
## 10. Monitoring
After deployment, monitor where applicable:
- Application health
- Error rates
- API failures
- Performance
- Database health
- Important user journeys
- Analytics events
Critical production problems should trigger investigation and, when necessary, rollback.
## 11. Rollback
A rollback strategy should be understood before production deployment.
When a deployment causes a critical problem:
1. Identify the impact.
2. Stop further promotion.
3. Determine whether rollback is appropriate.
4. Roll back or apply the approved recovery procedure.
5. Verify system health.
6. Document the incident and follow-up work.
## 12. Deployment Evidence
Deployment evidence should be retained where appropriate.
Examples include:
- CI results
- Test results
- Preview deployment
- Staging validation
- Product Acceptance confirmation
- Production deployment result
- Post-deployment verification
## 13. Definition of Done
A feature is deployment-complete when the required technical and product gates have been satisfied.
Technical readiness includes:
- CI passed
- Required tests passed
- Build succeeded
- Required environments validated
- Security reviewed
- Deployment configuration verified
Product readiness includes:
- Product expectations satisfied
- UX expectations satisfied
- Business expectations satisfied
- Compliance expectations satisfied where applicable
- Product Acceptance completed
> Technical readiness does not replace Product Acceptance.
## Key Principle
> Technology validates technical readiness. Product Acceptance validates that the product is ready for the business, user, UX, and compliance expectations. Production deployment requires both where applicable.
