import React, { useEffect, useRef, useState } from 'react'
import { AlertContext } from '../context/AlertProvider'
import { useContext } from 'react'
import { TbFaceIdError } from 'react-icons/tb'
import { GrStatusGood } from 'react-icons/gr'
import { FaTimes } from 'react-icons/fa'

import '../css/toast.css'

const Toast = green => {
    const {
        alertData,
        alertArray,
        closeSingleAlert,
        pushObj,
        closeAlert,
        animation,
    } = useContext(AlertContext)
    let check = green.green

    useEffect(() => {
        pushObj()
    }, [alertData])

    let greenObj = {
        id: `1`,
        title: 'Task completed',
        icon: <GrStatusGood />,
        status: 'success',
    }
    let switcher = []
    if (check === 'test') {
        switcher = [greenObj]
    } else {
        switcher = alertArray
    }

    //   const test = document.body.classList.add('bg-salmon')

    return (
        <div className="alert-section">
            {switcher.map((i, index) => {
                const { id, status, title, icon } = i
                return (
                    <article
                        key={index}
                        data-id={id}
                        className={`alert-article ${status} ${animation}`}
                    >
                        <div className="alert-body">
                            {icon}
                            <span className="alert-message">{title}</span>
                        </div>

                        <div
                            onClick={() => {
                                check === 'test'
                                    ? closeAlert()
                                    : closeSingleAlert(id)
                            }}
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

export default Toast
