import React from 'react';
import Select from 'javascript/components/select';

export default class AsyncSlect extends Select.Async {

    render () {
      const { children, loadingPlaceholder, placeholder, searchPromptText } = this.props;
      const { isLoading, options } = this.state;

      const props = {
        ...this.props,
        noResultsText: isLoading ? loadingPlaceholder : searchPromptText,
        placeholder: isLoading ? loadingPlaceholder : placeholder,
        options: isLoading ? [] : options,
        isLoading,
        onInputChange: this._onInputChange,
        onFocus: function(){
          const placeholderElement = document.getElementsByClassName('Select-placeholder');
          if(placeholderElement.length > 0){
            placeholderElement[0].style.display = 'none'
          }
        },
        onBlur: function(){
          const placeholderElement = document.getElementsByClassName('Select-placeholder');
          if(placeholderElement.length > 0){
            placeholderElement[0].style.display = 'block'
          }
        }
      };

      return (
        <Select {...props}/>
      )
    }

}