data "aws_iam_policy_document" "ecs_task_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution" {
  name               = "${var.project_name}-ecs-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# The managed policy above covers ECR pull + CloudWatch Logs, but not reading
# the app secrets injected into the container definition — grant that too.
data "aws_iam_policy_document" "read_app_secrets" {
  statement {
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      aws_secretsmanager_secret.db_password.arn,
      aws_secretsmanager_secret.jwt_secret.arn,
    ]
  }
}

resource "aws_iam_role_policy" "read_app_secrets" {
  name   = "${var.project_name}-read-app-secrets"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.read_app_secrets.json
}
