import { initial } from 'lodash'
import React, {
    createContext,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from 'react'

export const AlertContext = createContext(null)

const SET_ALERT_DATA_ACTION = 'SET_ALERT_DATA'
const SET_VISIBILITY_ACTION = 'SET_VISIBILITY'
const RESET_ALERT_ACTION = 'RESET_ALERT'
const TRIGGER_ALERT_ACTION = 'TRIGGER_ALERT'
const CLEAR_ARRAY_ACTION = 'CLEAR_ARRAY_ACTION'
const CLOSE_SINGLE_ALERT_ACTION = 'CLOSE_SINGLE_ALERT_ACTION'
const CLOSE_ALL_ALERT_ACTION = 'CLOSE_ALL_ALERT_ACTION'
const SET_ALERT_ACTION = 'SET_ALERT_ACTION'

const alertReducer = (state, action) => {
    switch (action.type) {
        case SET_ALERT_DATA_ACTION:
            return {
                ...state,
                alertBody: action.payload.alertBody, // data: { severity: 'success', title: 'my title', description: 'my desc'}
            }
        case SET_VISIBILITY_ACTION:
            return {
                ...state,
                isOpen: action.payload.isOpen,
                // alertArray: action.payload.alertArray,
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

        case CLOSE_SINGLE_ALERT_ACTION:
            return {
                ...state,
                alertArray: action.payload,
            }
        case CLOSE_ALL_ALERT_ACTION:
            return {
                ...state,
                alertArray: action.payload,
            }
        case SET_ALERT_ACTION:
            return {
                ...state,
                alertArray: action.payload,
            }

        default:
            return state
    }
}

//

const AlertProvider = ({ children }) => {
    const initialState = {
        isOpen: false,
        data: {},
        alertArray: [],
        alertBody: {},
    }

    const [alert, dispatch] = useReducer(alertReducer, initialState)
    // const [alertArray, setAlertArray] = useState([])
    const [trigAnime, setTrigAnime] = useState(false)

    const resetAlert = useCallback(payload => {
        dispatch({ type: RESET_ALERT_ACTION })
    }, [])

    const setAlert = useCallback(array => {
        dispatch({
            type: SET_ALERT_ACTION,
            payload: array,
        })
    }, [])
    const closeAlert = useCallback(() => {
        dispatch({
            type: SET_VISIBILITY_ACTION,
            payload: { isOpen: false },
        })
    }, [])

    const showAlert = useCallback(() => {
        dispatch({ type: SET_VISIBILITY_ACTION, payload: { isOpen: true } })
    }, [])

    const triggerAlert = useCallback(payload => {
        dispatch({ type: TRIGGER_ALERT_ACTION, payload })
    }, [])

    const closeSingleAlert = item => {
        const newArray = alert.alertArray.filter(i => {
            return i.itemId !== item
        })

        dispatch({
            type: CLOSE_SINGLE_ALERT_ACTION,
            payload: newArray,
        })
    }
    const closeAllAlerts = () => {
        const newArray = []
        dispatch({
            type: CLOSE_ALL_ALERT_ACTION,
            payload: newArray,
        })
    }
    useEffect(() => {
        if (!alert.isOpen) {
            closeAllAlerts()
        }
    }, [alert.data])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            closeAlert()
        }, 3000)
        return () => {
            clearTimeout(timeoutId)
        }
    }, [alert.data])

    return (
        <AlertContext.Provider
            value={{
                dispatchAlert: dispatch,
                isAlertOpen: alert.isOpen,
                alertData: alert.data,
                alertArray: alert.alertArray,
                closeAlert,
                showAlert,
                triggerAlert,
                closeSingleAlert,
                closeAllAlerts,
                setAlert,
            }}
        >
            {children}
        </AlertContext.Provider>
    )
}

export default AlertProvider

// const testClose = async () => {
//     const test = alert.alertArray.forEach(i => {
//         i.slide = 'true'
//     })

//     setTrigAnime(!trigAnime)

//     await new Promise(r => setTimeout(r, 1000))
//     closeAlert()
// }
// const clearArray = useCallback(payload => {
//     dispatch({ type: CLEAR_ARRAY_ACTION, payload: { alertArray: [] } })
// }, [])
