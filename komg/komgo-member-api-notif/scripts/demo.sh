#!/bin/bash

baseUrl=${SERVER_ADDR:-"localhost:3102"}/v0

echo $#

if [ "$#" -eq 0 ]; then
    echo "Command name is required."
    echo "  demo.sh <task-name>"
    exit 1
fi

# user IDs
jbourne=52543fee-e1a9-4442-8098-cf5c0760044d
nsmith=c84b8cf0-ba44-4c07-af83-d7eb88f9b394
jadams=772eec31-fa7d-4498-a2f6-c2df63eeea4f

post-task () {
  curl -X POST $baseUrl/tasks -H 'Content-Type: application/json' -d @-
}

create-notification () {
  cat <<EOF | curl -X POST $baseUrl/notifications -H 'Content-Type: application/json' -d @-
{
  "productId": "administration",
  "type": "msg",
  "level": "success",
  "toUser": "$1",
  "context": {
    "taskId": "$2"
  },
  "message": "$3"
}
EOF
}

create-tasks () {
  if [ "$#" -ne 1 ]; then
    echo "Company id is required"
    echo "  demo.sh create-tasks <company-static-id>"
    exit 1
  fi

  counterpartyStaticId=$1

  echo "Creating tasks with counterparty static id $counterpartyStaticId"

  # Overdue
  cat <<EOF | post-task | jq -r ._id
{
  "summary": "Complete document request",
  "taskType": "KYC.ReviewDocuments",
  "status": "To Do",
  "counterpartyStaticId": "$counterpartyStaticId",
  "context": {"myKey": "myValue"},
  "requiredPermission": {
    "productId": "administration",
    "actionId": "manageUsers"
  },
  "dueAt": "2018-09-05T14:22:20.909Z"
}
EOF

  # Assigned
  id=$(cat <<EOF | post-task | jq -r ._id
{
  "summary": "Review documents received",
  "taskType": "KYC.ReviewDocuments",
  "status": "To Do",
  "counterpartyStaticId": "$counterpartyStaticId",
  "assignee": "$jbourne",
  "context": {"reviewDocuments": "1234"},
  "requiredPermission": {
    "productId": "administration",
    "actionId": "manageUsers"
  },
  "dueAt": "2018-12-16T14:22:20.909Z"
}
EOF
)
create-notification $jbourne $id "Review documents received"

  # In Prgoress
  id=$(cat <<EOF | post-task | jq -r ._id
{
  "summary": "Complete document request",
  "taskType": "KYC.ReviewDocuments",
  "status": "In Progress",
  "counterpartyStaticId": "$counterpartyStaticId",
  "assignee": "$jadams",
  "context": {"reviewDocuments": "4321"},
  "requiredPermission": {
    "productId": "administration",
    "actionId": "manageUsers"
  },
  "dueAt": "2018-11-09T14:22:20.909Z"
}
EOF
)
create-notification $jadams $id "Complete document request"

cat <<EOF | curl -X PATCH $baseUrl/tasks -H 'Content-Type: application/json' -d @-
{
  "status": "In Progress",
  "context": {"reviewDocuments": "4321"}
}
EOF

  # Completed
  id=$(cat <<EOF | post-task | jq -r ._id
{
  "summary": "Review issued L/C",
  "taskType": "KYC.ReviewDocuments",
  "status": "In Progress",
  "counterpartyStaticId": "$counterpartyStaticId",
  "assignee": "$nsmith",
  "context": {"reviewDocuments": "1651813"},
  "requiredPermission": {
    "productId": "administration",
    "actionId": "manageUsers"
  },
  "dueAt": "2018-10-25T14:22:20.909Z"
}
EOF
)

cat <<EOF | curl -X PATCH $baseUrl/tasks -H 'Content-Type: application/json' -d @-
{
  "status": "Done",
  "outcome": true,
  "comment": "10 documents has been reviewed\n10 documents has been approved",
  "context": {"reviewDocuments": "1651813"}
}
EOF

}

main () {
  case "$1" in
    create-tasks) create-tasks $2 ;;
    *)
      echo "[!] Unrecognized command"
      exit 1
      ;;
  esac
}

main $@
