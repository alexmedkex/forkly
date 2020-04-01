import * as React from 'react'
import { CreateUserData } from './types'

interface Props {
  postUserAsync(userData: CreateUserData): void
}

const anonUserData: CreateUserData = {
  username: 'anonuser',
  firstname: 'anon',
  lastname: 'user',
  email: 'anon@user.com',
  password: ''
}

const createAnonUser = () => {
  const hundred = 100
  const randomUserNameSuffix = Math.floor(Math.random() * hundred)
  const randomisedUserName = `${anonUserData.username}${randomUserNameSuffix}`
  const randomisedUserEmail = `${randomisedUserName}@user.com`
  return Object.assign({}, anonUserData, { username: randomisedUserName, email: randomisedUserEmail })
}

class CreateAnonUserButton extends React.Component<Props> {
  render() {
    return <button onClick={e => this.props.postUserAsync(createAnonUser())}>Create User</button>
  }
}

export default CreateAnonUserButton
