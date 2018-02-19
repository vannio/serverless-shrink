# Serverless Shrink

URL shortener API built with the
[Serverless framework](https://serverless.com).

`POST` a URL to https://go.vann.io:
```shell
curl -H "Content-Type: application/json" -X POST -d '{"url": "http://www.superlongridiculousurl.com"}' https://go.vann.io
```

Example response:
```json
{
  "message": "Success",
  "data": {
    "url": "http://www.superlongridiculousurl.com",
    "shrink": "go.vann.io/a43f3e1ce0"
  }
}
```

---

#### Prerequisites

* [Node](https://nodejs.org)
* [Serverless framework](https://serverless.com/framework/docs/getting-started)
* [AWS CLI](https://aws.amazon.com/cli)

---

#### Initialise

1. Generate user access and secret keys from IAM 
1. Run `aws configure` to set up AWS caller identity
1. Check config by running `aws sts get-caller-identity`

#### Deployment

1. Ensure stage config is set correctly in the `vars` directory<sup>\*</sup>
1. Comment out the `CustomDomainMap` block in `serverless.yml`<sup>\*</sup>
1. **Run `sls deploy --stage <stage>` where stage is dev or prod**, eg. `--stage
   dev`
1. Set up API Gateway custom domain name mapping
1. Add DNS records to point your domain to API Gateway<sup>\*</sup>
1. Restore the `CustomDomainMap` block in `serverless.yml`<sup>\*</sup>
1. Re-run `sls deploy --stage <stage>`<sup>\*</sup>

<sup>\*</sup>on initial deploy

#### Debugging

* Logs can be found in CloudWatch
* If things are unsalvageable, you can delete everything to start from scratch:
  1. Remove custom domain name mapping from API Gateway manually
  1. Run `sls remove --stage <stage>`
