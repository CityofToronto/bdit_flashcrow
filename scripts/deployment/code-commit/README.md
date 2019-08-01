# AWS CodeCommit Deployment

To deploy to EC2, use the `deploy_code_commit.sh` script to push latest master to AWS CodeCommit.  This automatically triggers a deployment via AWS CodeDeploy.

`deploy_code_commit.sh` runs our "continuous integration" scripts, and pushes only if they pass.
