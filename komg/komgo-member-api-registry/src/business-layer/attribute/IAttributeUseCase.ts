import Attribute from '../../data-layer/models/Attribute'

export default interface IAttributeUseCase {
  addAttribute(companyEnsDomain: string, attribute: Attribute): Promise<string>
}
