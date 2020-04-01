update_tools_dir=`pwd`/update-tools


create_mr_or_update () {
    echo "retrieving project id"
    url_for_project=$(git remote get-url --all origin | awk -F: '{printf $2;}' | hexdump -v -e '/1 "%02x"' | sed 's/\(..\)/%\1/g')
    project_id=$(curl --header "PRIVATE-TOKEN: $GITLAB_API_TOKEN" https://gitlab.com/api/v4/projects/$url_for_project| jq '.id')

    echo "delete existing updates branch"
    curl --request DELETE --header "PRIVATE-TOKEN: $GITLAB_API_TOKEN" https://gitlab.com/api/v4/projects/$project_id/repository/branches/KOMGO-update-package



    echo "create branch for updates"
    curl -X POST --header "PRIVATE-TOKEN: $GITLAB_API_TOKEN" -F ref=develop -F branch=KOMGO-update-package  https://gitlab.com/api/v4/projects/$project_id/repository/branches

    echo "commiting updates"
    files_to_commit=`git diff --name-only`
    PAYLOAD=`node $update_tools_dir/gen_commit_payload.js $files_to_commit`
    echo $PAYLOAD | curl --request POST --header "PRIVATE-TOKEN: $GITLAB_API_TOKEN" --header "Content-Type: application/json" --data @- https://gitlab.com/api/v4/projects/$project_id/repository/commits

    echo "create MR for updates"
    MR_PAYLOAD=$(cat << EOF
{
    "source_branch": "KOMGO-update-package",
    "target_branch": "develop",
    "title": "Komgo npm package updates", 
    "remove_source_branch": true,
    "squash": true
}
EOF
    )

    curl --request POST --header "PRIVATE-TOKEN: $GITLAB_API_TOKEN" --header "Content-Type: application/json" --data "$MR_PAYLOAD" https://gitlab.com/api/v4/projects/$project_id/merge_requests
}

for repo in komgo-*; do
    pushd $repo
    if [ -e package.json ]; then
        npm i
        npm update
        if [ -n "$(git diff --name-only)" ]; then
            create_mr_or_update
        fi
        rm -rf node_modules
    fi
    popd

done
