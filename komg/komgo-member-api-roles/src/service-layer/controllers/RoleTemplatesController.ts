import { products } from '@komgo/permissions'
import { Route, Get, Controller, Security, Tags } from 'tsoa'

import { inject, provideSingleton } from '../../inversify/ioc'
import { IProductActionsResponse } from '../responses/product/IProductActionsResponse'

/**
 * Roles Templates Class
 * @export
 * @class RoleTemplatesController
 * @extends {Controller}
 */
@Tags('Roles')
@Route('role-templates')
@provideSingleton(RoleTemplatesController)
export class RoleTemplatesController extends Controller {
  constructor(@inject('is-komgo-node') private readonly isKomgoNode) {
    super()
  }

  /**
   * @summary get role templates
   */
  @Security('withPermission', ['administration', 'manageRoles', 'read'])
  @Get()
  public async GetTemplates(): Promise<IProductActionsResponse[]> {
    return this.filterProducts(products, this.isKomgoNode)
  }

  private filterProducts = (allProducts, isKomgoNode) =>
    allProducts.map(product => {
      const actions = product.actions
        .filter(action => isKomgoNode || !action.komgoNodeOnly)
        .map(action => ({ id: action.id, label: action.label, permissions: action.permissions }))
      return { ...product, actions }
    })
}
