import React from 'react'
import StickyPortal from 'part:@sanity/components/portal/sticky'
//import StateMenu from 'part:@sanity/components/menus/state'
import {storiesOf, action} from 'part:@sanity/storybook'
import {withKnobs, boolean} from 'part:@sanity/storybook/addons/knobs'
import Sanity from 'part:@sanity/storybook/addons/sanity'
import Chance from 'chance'
const chance = new Chance()

const showResize = function (resizeObject) {
  console.log(resizeObject)
}

storiesOf('Portal')
.addDecorator(withKnobs)
.add(
  'Sticky',
  () => {

    const scrollStyle = {
      width: '70vw',
      height: '70vh',
      border: '1px dotted #ccc',
      position: 'relative',
      overflow: 'scroll'
    }

    return (
      <Sanity part="part:@sanity/components/portal/sticky" propTables={[StickyPortal]}>
        <div
          style={scrollStyle}
        >
          {chance.paragraph()}
          <StickyPortal
            onClose={action('onClose')}
            isFullwidth={boolean('isFullWidth (prop)', false)}
            onResize={showResize}
          >
            <div
              style={{
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,0,0,0.5)',
                zIndex: 5000
              }}
            >
              Content
            </div>
          </StickyPortal>
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
        </div>
      </Sanity>
    )
  }
)

.add(
  'Sticky (nested)',
  () => {

    const scrollStyle = {
      width: '70vw',
      height: '70vh',
      border: '1px dotted #ccc',
      position: 'relative',
      overflow: 'scroll'
    }

    return (
      <Sanity part="part:@sanity/components/portal/sticky" propTables={[StickyPortal]}>
        <div
          style={scrollStyle}
        >
          {chance.paragraph()}
          <StickyPortal
            onClose={action('onClose')}
            isFullwidth={boolean('isFullWidth (prop)', false)}
          >
            <div
              style={{
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,0,0,1)',
                zIndex: 5000
              }}
            >
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              <StickyPortal
                onClose={action('onClose')}
                onResize={showResize}
                isFullwidth={boolean('isFullWidth (prop)', false)}
              >
                <div
                  style={{
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255,0,0,1)',
                    zIndex: 5000
                  }}
                >
                  {chance.paragraph()}
                  {chance.paragraph()}
                  {chance.paragraph()}
                  {chance.paragraph()}
                  {chance.paragraph()}
                  {chance.paragraph()}
                  {chance.paragraph()}
                  {chance.paragraph()}
                </div>
              </StickyPortal>
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
            </div>
          </StickyPortal>
        </div>
      </Sanity>
    )
  }
)

.add(
  'Sticky (simple)',
  () => {

    const scrollStyle = {
      width: '80vw',
      height: '80vh',
      border: '1px dotted #ccc',
      position: 'relative',
      overflow: 'scroll'
    }

    return (
      <Sanity part="part:@sanity/components/portal/sticky" propTables={[StickyPortal]}>
        <div
          style={scrollStyle}
        >
          {chance.paragraph()}
          <StickyPortal
            onClose={action('onClose')}
            isFullwidth={boolean('isFullWidth (prop)', false)}
          >
            <div
              style={{
                border: '1px solid magenta',
                backgroundColor: 'rgba(120,0,120,0.3)',
                position: 'abolute',
                top: '0',
                left: '0',
                bottom: '0',
                width: '300px',
                height: '100%',
                overflow: 'scroll'
              }}
            >
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
              {chance.paragraph()}
            </div>
          </StickyPortal>
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
          {chance.paragraph()}
        </div>
      </Sanity>
    )
  }
)
