import type { Pizza } from '../types';
import { ChilliIcon, LeafIcon } from './icons';

/** Small inline badges after a pizza name: one chilli per heat level, a leaf for vegetarian */
export function PizzaTags({ pizza }: { pizza: Pizza }) {
  if (!pizza.heat && !pizza.vegetarian) return null;
  return (
    <span className="pizza-tags">
      {pizza.heat > 0 && (
        <span className="tag-heat" title={`Heat ${pizza.heat} of 3`}>
          {Array.from({ length: pizza.heat }, (_, i) => (
            <ChilliIcon key={i} size={12} />
          ))}
          <span className="visually-hidden">Heat {pizza.heat} of 3</span>
        </span>
      )}
      {pizza.vegetarian && (
        <span className="tag-veg" title="Vegetarian">
          <LeafIcon size={12} />
          <span className="visually-hidden">Vegetarian</span>
        </span>
      )}
    </span>
  );
}
