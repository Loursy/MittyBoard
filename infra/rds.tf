resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-db-subnets"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = "mittyboard"
  username = "postgres"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Single instance, no HA — this is a starter setup. Add multi_az = true
  # and a longer backup_retention_period before relying on this for real.
  multi_az                = false
  backup_retention_period = 1
  skip_final_snapshot     = true
  publicly_accessible     = false
  deletion_protection     = false
}
