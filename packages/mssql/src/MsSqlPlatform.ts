import { AbstractSqlPlatform } from '@mikro-orm/knex';
// @ts-expect-error no types available
import SqlString from 'tsqlstring';
import { MsSqlSchemaHelper } from './MsSqlSchemaHelper';
import { MsSqlExceptionConverter } from './MsSqlExceptionConverter';
import type { IDatabaseDriver, EntityManager, MikroORM } from '@mikro-orm/core';
import { MsSqlSchemaGenerator } from './MsSqlSchemaGenerator';

// TODO check what methods are needed
export class MsSqlPlatform extends AbstractSqlPlatform {

  protected override readonly schemaHelper: MsSqlSchemaHelper = new MsSqlSchemaHelper(this);
  protected override readonly exceptionConverter = new MsSqlExceptionConverter();

  /** @inheritDoc */
  override lookupExtensions(orm: MikroORM): void {
    MsSqlSchemaGenerator.register(orm);
  }

  override usesOutputStatement(): boolean {
    return true;
  }

  override convertDateToJSValue(value: string | Date): string {
    if (typeof value === 'string') {
      return value;
    }

    return value.toISOString().substring(0, 10);
  }

  // TODO verify
  override convertsJsonAutomatically(): boolean {
    return false;
  }

  override getCurrentTimestampSQL(length: number): string {
    return `current_timestamp`;
  }

  override getTimeTypeDeclarationSQL(): string {
    return 'time';
  }

  override getRegExpOperator(): string {
    throw new Error('Not supported');
  }

  override getBlobDeclarationSQL(): string {
    return 'varbinary(max)';
  }

  override getJsonDeclarationSQL(): string {
    return 'nvarchar(max)';
  }

  override quoteIdentifier(id: string): string {
    return `[${id.replace('.', `].[`)}]`;
  }

  override quoteValue(value: any): string {
    if (value instanceof Buffer) {
      return `0x${value.toString('hex')}`;
    }

    if (value instanceof Date) {
      return SqlString.dateToString(value.toISOString(), 'Z');
    }

    return SqlString.escape(value);
  }

  /* istanbul ignore next: kept for type inference only */
  override getSchemaGenerator(driver: IDatabaseDriver, em?: EntityManager): MsSqlSchemaGenerator {
    return new MsSqlSchemaGenerator(em ?? driver as any);
  }

}
