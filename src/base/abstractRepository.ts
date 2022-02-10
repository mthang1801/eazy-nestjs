import { ObjectLiteral } from '../common/ObjectLiteral';

export declare class AbstractRepository<Entity extends ObjectLiteral> {
  create(params: any): Promise<Entity>;
  findById(id: number): Promise<Entity>;
  findOne(options: any): Promise<Entity>;
  delete(id: number): Promise<boolean>;
  find(options: any): Promise<any[]>;
  update(id: number, params: any): Promise<Entity>;
}
