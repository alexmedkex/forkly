export interface ICreateUserRequest {
  Username: string
  Email: string
  Password: string
  RealName: string
  Comment: string
}

export interface IHarborUser {
  user_id: string
  username: string
}

export interface IHarborProject {
  name: string
}

interface IHarborMemberGroup {
  id: number
  group_name: string
}

export interface IAddProjectMemberRequest {
  role_id: number
  member_user: IHarborUser
  member_group: IHarborMemberGroup
}
