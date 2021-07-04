// import React from 'react';
import Select from 'react-select';
// import TetherComponent from 'react-tether';

/** from https://github.com/JedWatson/react-select/issues/810#issuecomment-250274937 **/
/**
 * Matt Pocock, 14/6/2019
 *
 * The solution below does not work on mobile menus, so I'm disabling it in favour of
 * the raw react-select
 */

// export default class TetheredSelectWrap extends Select {

//     constructor(props) {
//         super(props);

//         this.renderOuter = this._renderOuter;
//     }

//     _renderOuter() {
//         const menu = super.renderOuter.apply(this, arguments);

//         // Don't return an updated menu render if we don't have one
//         if (!menu) {
//             return;
//         }

//         /** this.wrapper comes from the ref of the main Select component (super.render()) **/
//         const selectWidth = this.control ? this.control.offsetWidth : null;

//         return (
//             <TetherComponent
//                 renderElementTo="body"
//                 ref="tethered-component"
//                 attachment="top left"
//                 targetAttachment="top left"
//                 offset="0 -5px"
//                 constraints={[{
//                     to: 'window',
//                     attachment: 'together',
//                     pin: ['top']
//                 }]}
//             >
//                 {/* Apply position:static to our menu so that it's parent will get the correct dimensions and we can tether the parent */}
//                 <div></div>
//                 {React.cloneElement(menu, {style: {position: 'static', width: (selectWidth - 14)}})}
//             </TetherComponent>
//         );
//     }

// }

export default Select;