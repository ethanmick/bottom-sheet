import { mergeRefs } from '@react-aria/utils'
import { motion, useAnimation } from 'framer-motion'
import {
  createContext,
  DOMAttributes,
  forwardRef,
  RefObject,
  useContext,
  useEffect,
  useRef
} from 'react'
import {
  AriaButtonProps,
  DismissButton,
  FocusScope,
  mergeProps,
  OverlayContainer,
  useDialog,
  useModal,
  useOverlay,
  useOverlayTrigger,
  usePress
} from 'react-aria'
import { OverlayTriggerState, useOverlayTriggerState } from 'react-stately'
import useMeasure from 'react-use-measure'

type Children = { children?: React.ReactNode }
type DivProps = React.HTMLAttributes<HTMLDivElement>

type Context = {
  triggerRef: RefObject<HTMLDivElement>
  overlayRef: RefObject<HTMLDivElement>
  state: OverlayTriggerState
  triggerProps: AriaButtonProps<'button'>
  overlayProps: DOMAttributes<any>
}

// @ts-ignore
const MenuContext = createContext<Context>(undefined)
const useMenu = () => useContext(MenuContext)

type MenuProps = Children & DivProps & {}

const Menu = forwardRef<HTMLDivElement, MenuProps>((props, forwardedRef) => {
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef(null)
  const overlayRef = useRef(null)
  const state = useOverlayTriggerState({})

  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    state,
    triggerRef
  )

  const { children } = props

  const context: Context = {
    overlayRef,
    triggerRef,
    state,
    overlayProps,
    triggerProps
  }

  return (
    <div ref={mergeRefs(ref, forwardedRef)}>
      <MenuContext.Provider value={context}>{children}</MenuContext.Provider>
    </div>
  )
})

type TriggerProps = Children & {}

const Trigger = forwardRef<HTMLDivElement, TriggerProps>(
  (props, forwardedRef) => {
    const { triggerRef, triggerProps } = useMenu()
    let { pressProps } = usePress({
      ...triggerProps
    })
    const { children, ...rest } = props

    return (
      <div
        ref={mergeRefs(triggerRef, forwardedRef)}
        role="button"
        {...mergeProps(props, pressProps, rest)}
      >
        {children}
      </div>
    )
  }
)

type BottomSheetProps = Children & {}

const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  (props, forwardedRef) => {
    const bgControls = useAnimation()
    const controls = useAnimation()
    const { overlayRef, state } = useMenu()
    const { modalProps } = useModal()
    const { dialogProps } = useDialog({}, overlayRef)
    const [ref, bounds] = useMeasure()
    const height = bounds.height - 112

    const { overlayProps } = useOverlay(
      {
        onClose: exit,
        isOpen: state.isOpen,
        isDismissable: true
      },
      overlayRef
    )

    useEffect(() => {
      if (state.isOpen) {
        console.log('Height', height)
        setTimeout(() => {
          controls.start(
            {
              y: window.innerHeight - height
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
        })
      }
    }, [state.isOpen, height])

    const { children, ...rest } = props

    async function exit() {
      await Promise.all([
        controls.start({
          y: window.innerHeight,
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
      state.close()
    }

    // if (!state.isOpen) return null

    const y = typeof window != 'undefined' ? window.innerHeight : 0
    const top = typeof window != 'undefined' ? window.innerHeight - height : 0

    return state.isOpen ? (
      <OverlayContainer>
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
            y
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 100
          }}
          drag="y"
          dragConstraints={{
            top,
            bottom: -200
          }}
          dragElastic={{
            top: 0.05,
            bottom: 1
          }}
          onDragEnd={async (_, info) => {
            if (info.velocity.y > 100) {
              await Promise.all([
                controls.start({
                  y: window.innerHeight,
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
              state.close()
            }
          }}
          className="fixed focus:outline-none left-0 right-0"
          style={{
            height,
            zIndex: 9999
          }}
        >
          <FocusScope restoreFocus>
            <div
              {...(mergeProps(
                overlayProps,
                dialogProps,
                rest,
                modalProps
              ) as any)}
              ref={mergeRefs(forwardedRef, overlayRef, ref)}
              className="bg-neutral-700 w-full focus:outline-none rounded-t-xl pb-32"
            >
              {children}
              <DismissButton onDismiss={state.close} />
            </div>
          </FocusScope>
        </motion.div>
      </OverlayContainer>
    ) : null
  }
)

const pkg = Object.assign(Menu, {
  Trigger,
  BottomSheet
})
export { useMenu as useMenu }
export { pkg as Menu }
