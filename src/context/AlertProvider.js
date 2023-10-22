import React, {
    createContext,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from 'react'
import { TbFaceIdError } from 'react-icons/tb'
import { GrStatusGood } from 'react-icons/gr'

export const AlertContext = createContext(null)

const SET_ALERT_DATA_ACTION = 'SET_ALERT_DATA'
const SET_VISIBILITY_ACTION = 'SET_VISIBILITY'
const RESET_ALERT_ACTION = 'RESET_ALERT'
const TRIGGER_ALERT_ACTION = 'TRIGGER_ALERT'
const CLOSE_SINGLE_ALERT = 'CLOSE_SINGLE_ALERT'

const alertReducer = (state, action) => {
    switch (action.type) {
        case SET_ALERT_DATA_ACTION:
            return {
                ...state,
                data: action.payload.data, // data: { severity: 'success', title: 'my title', description: 'my desc'}
            }
        case SET_VISIBILITY_ACTION:
            return {
                ...state,
                isOpen: action.payload.isOpen,
            }
        case RESET_ALERT_ACTION:
            return {
                ...state,
                isOpen: false,
                data: {},
                alertArray: [],
            }
        case TRIGGER_ALERT_ACTION:
            return {
                ...state,
                isOpen: true,
                data: action.payload,
            }
        case CLOSE_SINGLE_ALERT:
            return {
                ...state,
                alertArray: action.payload,
            }
        default:
            return state
    }
}

const AlertProvider = ({ children }) => {
    const initialState = {
        isOpen: false,
        data: {},
        alertArray: [],
    }

    const [alert, dispatch] = useReducer(alertReducer, initialState)

    const closeAlert = useCallback(() => {
        dispatch({ type: SET_VISIBILITY_ACTION, payload: { isOpen: false } })
    }, [])

    const showAlert = useCallback(() => {
        dispatch({ type: SET_VISIBILITY_ACTION, payload: { isOpen: true } })
    }, [])

    const setAlertData = useCallback(payload => {
        dispatch({ type: SET_ALERT_DATA_ACTION, payload })
    }, [])

    const triggerAlert = useCallback(payload => {
        dispatch({ type: TRIGGER_ALERT_ACTION, payload })
    }, [])
    const resetAlert = useCallback(payload => {
        dispatch({ type: RESET_ALERT_ACTION })
    }, [])

    const closeSingleAlert = item => {
        let closeOne = alert.alertArray.filter(i => {
            return i.id !== item
        })
        console.log('closeOne', closeOne)

        dispatch({ type: CLOSE_SINGLE_ALERT, payload: closeOne })
    }

    const pushObj = () => {
        let itemId = Math.floor(Date.now() + Math.random())
        let obj = {
            id: `${itemId}`,
            title: 'Wrong credentials',
            icon: <TbFaceIdError />,
            status: 'danger',
        }
        if (alert.data.severity === 'error') {
            alert.alertArray.push(obj)
        }
    }

    useEffect(() => {
        alert.alertArray.forEach(i => {
            const timeoutId = setTimeout(() => {
                closeSingleAlert(i.id)
            }, 3500)
            return () => {
                clearTimeout(timeoutId)
                resetAlert()
            }
        })
    })
    console.log(alert)

    return (
        <AlertContext.Provider
            value={{
                alertArray: alert.alertArray,
                dispatchAlert: dispatch,
                isAlertOpen: alert.isOpen,
                alertData: alert.data,
                closeAlert,
                showAlert,
                setAlertData,
                triggerAlert,
                closeSingleAlert,
                pushObj,
                resetAlert,
                show: alert.isOpen,
            }}
        >
            {children}
        </AlertContext.Provider>
    )
}

export default AlertProvider
