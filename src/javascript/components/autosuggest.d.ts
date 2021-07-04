interface AutosuggestProps {
  onSuggestionSelected: (suggestion: any) => void;
  placeholder: string;
  fetchSuggestions: () => Promise<any[]>;
  className?: string;
  suggestions: any[];
  onClear: () => void;
  titleExtractor?: (suggestion: any) => string;
  id?: string;
}

declare const Autosuggest: React.FC<AutosuggestProps>

export = Autosuggest