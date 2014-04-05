# TODO

## Releases

* Pull in / link to release notes / test evidence

## Impact Analysis

### Summary

* Group by certain facts:
	* Node role
  * Other?
* Initiate deployment

### Changes

* Text search for filtering results
* Toggle show assessed / low / medium / high
* Group by nodes when more than x

### Reports

* Link to report detail
* Link to change detail
* Link to node detail

## Deployment Scheduling

* Allow deployment schedules to be defined by role or other fact
* Schedules determine tier ordering (DEV -> UAT -> PROD -> DR)
* Schedules define minimum cool-off period between tiers
* Schedules define change windows for each role's tier

## Change Management

* Generate change ticket (ServiceNow first?)
* Include affected nodes
* Include test results, commits, and bug/feature ticket references where possible.
* Post-approval hooks

## Deployment

* Initiate deployment by updating environment in ENC

## Healthchecks

* Trigger [serverspec](http://serverspec.org/) integration tests over MCollective
* Dashboard for results

## Future

* OS Patching automation
* ??