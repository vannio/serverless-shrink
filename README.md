# Serverless Shrink

URL shortener API built with the
[Serverless framework](https://serverless.com).

## Usage

#### Request
```bash
curl --location --request POST 'https://go.vann.io' \
--header 'Content-Type: application/json' \
--data-raw '{"url": "http://www.superlongridiculousurl.com"}'
```

#### Response
```json
{
  "data": {
    "url": "http://www.superlongridiculousurl.com",
    "shrink": "go.vann.io/a43f3e1ce0"
  }
}
```

---

## Development

#### Prerequisites

* [Node](https://nodejs.org) 14+
* [Serverless framework](https://serverless.com/framework/docs/getting-started) 3+
* [AWS CLI](https://aws.amazon.com/cli)


#### Initialise

1. Generate user access and secret keys from IAM 
1. Run `aws configure` to set up AWS caller identity
1. Check config by running `aws sts get-caller-identity`

#### Deployment

1. Ensure stage config is set correctly in the `vars` directory<sup>\*</sup>
1. Comment out the `CustomDomainMap` block in `serverless.yml`<sup>\*</sup>
1. **Run `serverless deploy --stage <stage>` where stage is dev or prod**, eg. `--stage
   dev`
1. Set up your custom domain name mapping in API Gateway
1. Create and verify the accompanying SSL cert in the AWS Certificate Manager<sup>\*</sup>
1. Restore (uncomment) the `CustomDomainMap` block in `serverless.yml`<sup>\*</sup>
1. Re-run `serverless deploy --stage <stage>`<sup>\*</sup>

<sup>\*</sup>on initial deploy

#### Debugging

* Logs can be found in CloudWatch
* If things are unsalvageable, you can delete everything to start from scratch:
  1. Remove custom domain name mapping from API Gateway manually
  1. Run `serverless remove --stage <stage>`
