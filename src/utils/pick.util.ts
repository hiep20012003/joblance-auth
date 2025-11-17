import {Model} from 'sequelize';

export function pick<T extends Model, K extends keyof T['_attributes']>(
  model: T,
  attributes: readonly K[]
): Pick<T['_attributes'], K> {
  const plain = model.get({plain: true}) as T['_attributes'];

  const result = {} as Pick<T['_attributes'], K>;
  for (const key of attributes) {
    if (key in plain) {
      result[key] = plain[key];
    }
  }
  return result;
}

export function pickExclude<T extends Model, K extends keyof T['_attributes']>(
  model: T,
  exclude: readonly K[]
): Omit<T['_attributes'], K> {
  const plain = model.get({plain: true}) as T['_attributes'];
  const result = {} as Omit<T['_attributes'], K>;

  for (const key in plain) {
    const typedKey = key as keyof T['_attributes'];

    if ((exclude as readonly (keyof T['_attributes'])[]).includes(typedKey as K)) {
      continue;
    }

    result[typedKey as Exclude<keyof T['_attributes'], K>] = plain[typedKey];
  }

  return result;
}
