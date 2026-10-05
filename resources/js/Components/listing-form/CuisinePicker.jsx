import { POPULAR_CUISINES } from './categoryFieldConfig';
import SuggestTagsPicker from './SuggestTagsPicker';

/** Cuisine multi-select backed by popular suggestions + custom tags. */
export default function CuisinePicker(props) {
    return (
        <SuggestTagsPicker
            {...props}
            options={POPULAR_CUISINES}
            labelText="Cuisine / specialty"
            placeholder="Search popular cuisines or type your own…"
            suggestionsLabel="Popular cuisines"
            fieldHelp={
                props.fieldHelp ||
                'Start typing to filter popular cuisines, or add your own.'
            }
        />
    );
}
