import { motion, useAnimation } from 'framer-motion'
import type { NextPage } from 'next'
import React, { forwardRef, RefObject, useEffect } from 'react'
import {
  AriaButtonProps,
  DismissButton,
  FocusScope,
  mergeProps,
  OverlayContainer,
  useButton,
  useDialog,
  useModal,
  useOverlay,
  useOverlayPosition,
  useOverlayTrigger
} from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'

type Props = {
  isOpen?: boolean
  onClose: () => void
  height?: number
  children?: React.ReactNode
}

const BottomSheet = forwardRef<any, any>(
  ({ children, isOpen, onClose, ...rest }, ref: any) => {
    const controls = useAnimation()
    const bgControls = useAnimation()

    const exit = async () => {
      await Promise.all([
        controls.start({
          y: window.screen.height,
          transition: {
            duration: 0.25
          }
        }),
        bgControls.start({
          opacity: 0,
          transition: {
            duration: 0.25
          }
        })
      ])
      onClose()
    }

    const height = 400
    const { overlayProps } = useOverlay(
      {
        onClose: exit,
        isOpen,
        isDismissable: true
      },
      ref
    )

    // Hide content outside the modal from screen readers.
    const { modalProps } = useModal()

    // Get props for the dialog and its title
    let { dialogProps, titleProps } = useDialog({}, ref)

    useEffect(() => {
      if (isOpen) {
        controls.start(
          {
            height: height + 200,
            y: window.screen.height - height + 100
          },
          {
            duration: 0.2,
            type: 'spring',
            damping: 15,
            stiffness: 100
          }
        )
        bgControls.start(
          {
            opacity: 1
          },
          {
            duration: 0.3
          }
        )
      }
    }, [isOpen])

    return (
      <>
        <motion.div
          className="fixed z-50 top-0 bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm"
          initial={{
            opacity: 0
          }}
          animate={bgControls}
        />
        <motion.div
          animate={controls}
          initial={{
            height,
            y: window.screen.height
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 100
          }}
          drag="y"
          dragConstraints={{
            top: window.screen.height - height,
            bottom: -200
          }}
          dragElastic={{
            top: 0.05,
            bottom: 1
          }}
          onDragEnd={async (_, info) => {
            if (info.velocity.y > 100) {
              const duration = info.velocity.y
              await Promise.all([
                controls.start({
                  y: window.screen.height,
                  transition: {
                    duration: 0.2
                  }
                }),
                bgControls.start({
                  opacity: 0,
                  transition: {
                    duration: 0.25
                  }
                })
              ])
              onClose()
            }
          }}
          className="focus:outline-none"
          style={{
            position: 'fixed',
            height,
            zIndex: 9999,
            left: 0,
            right: 0
          }}
        >
          <FocusScope restoreFocus>
            <div
              {...mergeProps(overlayProps, dialogProps, rest, modalProps)}
              animate={controls}
              ref={ref}
              className="bg-neutral-700 w-full focus:outline-none rounded-t-xl"
              style={{
                height: 400
              }}
            >
              {children}
              <DismissButton onDismiss={onClose} />
            </div>
          </FocusScope>
        </motion.div>
      </>
    )
  }
)

type ButtonProps = AriaButtonProps<'button'> & {
  className?: string
  style?: any
  buttonRef: RefObject<any>
}

function Button(props: ButtonProps) {
  let ref = props.buttonRef
  let { buttonProps } = useButton(props, ref)
  return (
    <button
      {...buttonProps}
      className={props.className}
      ref={ref}
      style={props.style}
    >
      {props.children}
    </button>
  )
}

const Home: NextPage = () => {
  const state = useOverlayTriggerState({})
  const triggerRef = React.useRef(null)
  const overlayRef = React.useRef(null)

  // Get props for the trigger and overlay. This also handles
  // hiding the overlay when a parent element of the trigger scrolls
  // (which invalidates the popover positioning).
  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    state,
    triggerRef
  )

  // Get popover positioning props relative to the trigger
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef,
    placement: 'top',
    offset: 5,
    isOpen: state.isOpen
  })

  return (
    <div className="p-4 text-center">
      <Button
        className="rounded-full text-white bg-black px-4 py-2"
        buttonRef={triggerRef}
        {...triggerProps}
      >
        Click Me
      </Button>
      {state.isOpen && (
        <OverlayContainer>
          <BottomSheet
            {...overlayProps}
            ref={overlayRef}
            title="Popover title"
            isOpen={state.isOpen}
            onClose={state.close}
          >
            <div className="p-4">
              <h3 className="text-xs font-bold text-neutral-400">Sort by</h3>
              <ul>
                <li className="py-2 text-neutral-200">Custom order</li>
                <li className="py-2 text-neutral-200">Title</li>
                <li className="py-2 text-neutral-200">Artist</li>
                <li className="py-2 text-neutral-200">Album</li>
              </ul>
            </div>
          </BottomSheet>
        </OverlayContainer>
      )}
    </div>
  )
}

export default Home
