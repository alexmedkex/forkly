import { Document, Model } from 'mongoose'
import DataAccess from '@komgo/data-access'

import { ITask } from '../../../../service-layer/request/task'

import TaskSchema from './TaskSchema'

type TaskModel = ITask & Document

export const TaskRepository: Model<TaskModel> = DataAccess.connection.model<TaskModel>('task', TaskSchema)
