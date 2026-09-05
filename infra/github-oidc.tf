# Lets GitHub Actions assume an AWS role via short-lived OIDC tokens instead
# of long-lived access keys stored as secrets.

variable "github_repository" {
  description = "GitHub repo allowed to assume the deploy role, as 'owner/repo'."
  type        = string
  default     = "Loursy/MittyBoard"
}

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  # GitHub's OIDC signing thumbprint (rarely rotates; recheck against
  # https://github.blog if AWS ever rejects the token unexpectedly).
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_policy_document" "github_actions_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:*"]
    }
  }
}

resource "aws_iam_role" "github_actions_deploy" {
  name               = "${var.project_name}-github-actions-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume.json
}

data "aws_iam_policy_document" "github_actions_deploy" {
  statement {
    sid = "PushImages"
    actions = [
      "ecr:GetAuthorizationToken",
    ]
    resources = ["*"]
  }

  statement {
    sid = "PushImagesToOurRepos"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:BatchGetImage",
    ]
    resources = [
      aws_ecr_repository.backend.arn,
      aws_ecr_repository.frontend.arn,
    ]
  }

  statement {
    sid = "DeployToEcs"
    actions = [
      "ecs:DescribeTaskDefinition",
      "ecs:RegisterTaskDefinition",
      "ecs:UpdateService",
      "ecs:DescribeServices",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "PassTaskRoles"
    actions   = ["iam:PassRole"]
    resources = [aws_iam_role.ecs_task_execution.arn]
  }
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name   = "${var.project_name}-github-actions-deploy"
  role   = aws_iam_role.github_actions_deploy.id
  policy = data.aws_iam_policy_document.github_actions_deploy.json
}

output "github_actions_deploy_role_arn" {
  description = "Set this as the AWS_DEPLOY_ROLE_ARN secret in the GitHub repo."
  value       = aws_iam_role.github_actions_deploy.arn
}
