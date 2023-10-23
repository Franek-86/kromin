import React, { useEffect, useRef, useState } from 'react'
import AlertProvider, { AlertContext } from '../context/AlertProvider'
import { useContext } from 'react'
import { TbFaceIdError } from 'react-icons/tb'
import { FaTimes } from 'react-icons/fa'
import { GrStatusGood } from 'react-icons/gr'
import '../css/toast.css'
import useAlert from '../hooks/useAlert'

const Toast = () => {
    const {
        alertData,
        closeAlert,
        triggerAlert,
        alertArray,
        isAlertOpen,
        closeSingleAlert,
        setAlert,
        closeAllAlerts,
    } = useContext(AlertContext)
    const [trigAnime, setTrigAnime] = useState(false)

    const setAlertData = payload => {
        let id = Math.floor(Date.now() + Math.random())
        const successData = {
            itemId: id,
            title: `${payload.title}`,
            icon: <GrStatusGood />,
            status: `${payload.severity}`,
            slide: 'false',
        }
        const dangerData = {
            itemId: id,
            title: `${payload.title}`,
            icon: <TbFaceIdError />,
            status: `${payload.severity}`,
            slide: 'false',
        }

        let alertBody
        if (payload.severity === 'error') {
            alertBody = dangerData
        } else if (payload.severity === 'success') {
            alertBody = successData
        } else {
            alertBody = 'no data to display'
        }
        return alertBody
    }

    useEffect(() => {
        if (alertData) {
            let toastData = setAlertData(alertData)
            alertArray.push(toastData)
        }
    }, [alertData])

    const closeAfterAnime = async id => {
        alertArray.forEach(i => {
            if (i.itemId === id) {
                i.slide = 'true'
            }
        })
        await new Promise(r => setTimeout(r, 100))
        setTrigAnime(!trigAnime)
        closeSingleAlert()
    }

    const closeAllAfterAnime = async () => {
        alertArray.forEach(i => {
            i.slide = 'true'
        })
        await new Promise(r => setTimeout(r, 100))
        setTrigAnime(!trigAnime)
        closeAllAlerts()
    }

    useEffect(() => {
        setTimeout(() => {
            closeAllAfterAnime()
        }, 3000)
    }, [alertData])

    if (alertArray.length > 0) {
        return (
            <div className="alert-section">
                {alertArray.map((i, index) => {
                    const { itemId: id, status, title, icon, slide } = i
                    return (
                        <article
                            key={index}
                            data-id={id}
                            className={`alert-article ${status} ${
                                slide === 'true' ? 'anime' : 'nothing'
                            }`}
                        >
                            <div className="alert-body">
                                {icon}
                                <span className="alert-message">{title}</span>
                            </div>
                            <div
                                onClick={() => closeAfterAnime(id)}
                                className="alert-close"
                            >
                                <FaTimes />
                            </div>
                        </article>
                    )
                })}
            </div>
        )
    }
}

export default Toast
