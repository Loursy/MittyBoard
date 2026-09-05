terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and point at your own bucket before running this for real —
  # local state isn't safe for anything beyond a single-operator trial.
  # backend "s3" {
  #   bucket = "mittyboard-terraform-state"
  #   key    = "mittyboard/terraform.tfstate"
  #   region = "eu-central-1"
  # }
}

provider "aws" {
  region = var.aws_region
}
