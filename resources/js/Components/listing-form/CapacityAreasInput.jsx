import { asCapacityAreas, CAPACITY_AREAS } from '@/utils/eatDrinkDetails';
import { field, help, label } from './fieldStyles';

/**
 * Fixed area labels + digit-only seat counts.
 */
export default function CapacityAreasInput({
    id = 'capacity',
    value = {},
    onChange,
    fieldHelp = null,
}) {
    const areas = asCapacityAreas(value);

    const setArea = (key, raw) => {
        const digits = String(raw).replace(/\D/g, '');
        const next = { ...areas };
        if (digits === '') {
            delete next[key];
        } else {
            next[key] = Number(digits);
        }
        onChange(Object.keys(next).length ? next : null);
    };

    return (
        <div>
            <p className={label}>Seating capacity</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {CAPACITY_AREAS.map((area) => (
                    <div key={area.key} className="min-w-0">
                        <label
                            className="mb-1 block text-xs font-semibold text-olive-500 dark:text-olive-400"
                            htmlFor={`${id}_${area.key}`}
                        >
                            {area.label}
                        </label>
                        <input
                            id={`${id}_${area.key}`}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1}
                            className={field}
                            value={areas[area.key] ?? ''}
                            onChange={(e) => setArea(area.key, e.target.value)}
                            placeholder="0"
                        />
                    </div>
                ))}
            </div>
            {fieldHelp ? <p className={help}>{fieldHelp}</p> : null}
        </div>
    );
}
