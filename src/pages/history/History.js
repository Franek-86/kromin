import Container from '../../components/Container'
import Row from '../../components/Row'
import Column from '../../components/Column'
import TasksAPI from '../../http/task.http'
import {
    dateIsInRange,
    dateRenderer,
    groupByDate,
    handleApiError,
    isBeforeToday,
} from '../../utilities/helpers'
import { useEffect, useMemo, useState } from 'react'
import useError from '../../hooks/useError'
import FilterBar from '../home/filter-bar/FilterBar'
import HomeTableHeader from '../home/home-table-heading'
import { TASK_MODEL } from '../../models'
import { createUseStyles } from 'react-jss'
import Task from '../../components/Task'
import EditTaskModal from '../home/EditTaskModal'
import { useWindowSize } from '../../hooks/useWindowSize'

const useStyles = createUseStyles(theme => ({
    taskBodyRoot: {
        paddingTop: 0,
        height: `calc(${window.innerHeight}px - 184px)`,
        overflow: 'scroll',
        paddingBottom: 40,
        [theme.mediaQueries.lUp]: {
            paddingBottom: 16,
        },
    },
    section: {
        marginBottom: theme.spacing * 3,
    },
    sectionHeading: {
        display: 'block',
        margin: [theme.spacing * 3, 0, theme.spacing],
        fontSize: 14,
        fontWeight: 500,
        color: theme.palette.common.textBlack,
    },
}))
const Completed = () => {
    const [tasks, setTasks] = useState(null)
    const [dateFilter, setDateFilters] = useState('')
    const [priority, setPriority] = useState(false)
    const [searchInput, setSearchInput] = useState('')
    const [showEditModal, setShowEditModal] = useState(false)
    const [openedTask, setOpenedTask] = useState(null)

    const { width } = useWindowSize()
    const classes = useStyles()
    const isMobile = width < 600
    const onDeleteTask = async (task, index) => {
        try {
            await TasksAPI.deleteTask(task[TASK_MODEL.id])
            onDeleteItem(task[TASK_MODEL.date], index)
        } catch (error) {
            handleApiError({
                error,
                handleGeneralError: showError,
            })
        }
    }
    const onDeleteItem = (key, index) => {
        let newTasks = tasks
        if (isBeforeToday(key)) {
            newTasks['Expired'].splice(index, 1)
        } else {
            newTasks[key].splice(index, 1)
        }
        setTasks({ ...newTasks })
    }
    const onEditTask = async (oldTask, newTask) => {
        try {
            const { data } = await TasksAPI.editTask(newTask)
            onUpdateItem(oldTask, data)
        } catch (error) {
            handleApiError({
                error,
                handleGeneralError: showError,
            })
        }
    }

    const onUpdateItem = (oldItem, updatedItem) => {
        let newTasks = tasks
        const isDateChanged =
            updatedItem[TASK_MODEL.date] !== oldItem[TASK_MODEL.date] &&
            !(
                isBeforeToday(oldItem[TASK_MODEL.date]) &&
                isBeforeToday(updatedItem[TASK_MODEL.date])
            )

        if (isDateChanged) {
            //remove the task from old list
            if (isBeforeToday(oldItem[TASK_MODEL.date])) {
                newTasks['Expired'].filter(
                    task => task[TASK_MODEL.id] !== updatedItem[TASK_MODEL.id]
                )
            } else {
                newTasks[oldItem[TASK_MODEL.date]] = newTasks[
                    oldItem[TASK_MODEL.date]
                ].filter(
                    task => task[TASK_MODEL.id] !== updatedItem[TASK_MODEL.id]
                )
            }

            //add the task in new list
            if (isBeforeToday(updatedItem[TASK_MODEL.date])) {
                newTasks['Expired'].push(updatedItem)
            } else {
                if (updatedItem[TASK_MODEL.date] in newTasks) {
                    newTasks[updatedItem[TASK_MODEL.date]].push(updatedItem)
                } else {
                    newTasks[updatedItem[TASK_MODEL.date]] = [updatedItem]
                }
            }
        } else {
            //update the task in the same list
            if (isBeforeToday(updatedItem[TASK_MODEL.date])) {
                const taskToUpdateIndex = newTasks['Expired'].findIndex(
                    task => task[TASK_MODEL.id] === updatedItem[TASK_MODEL.id]
                )
                newTasks['Expired'][taskToUpdateIndex] = updatedItem
            } else {
                const taskToUpdateIndex = newTasks[
                    updatedItem[TASK_MODEL.date]
                ].findIndex(
                    task => task[TASK_MODEL.id] === updatedItem[TASK_MODEL.id]
                )
                newTasks[updatedItem[TASK_MODEL.date]][taskToUpdateIndex] =
                    updatedItem
            }
        }
        setTasks({ ...newTasks })
    }

    const showError = useError()
    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const {
                data: { data },
            } = await TasksAPI.getIndex()
            setTasks(groupByDate(data))
        } catch (error) {
            handleApiError({
                error,
                handleGeneralError: showError,
            })
        }
    }

    const filteredTasks = useMemo(() => {
        const filtered = {}
        if (tasks) {
            Object.keys(tasks).forEach(date => {
                const filteredDate = tasks[date].filter(t => {
                    const isInDate = dateFilter
                        ? dateIsInRange(
                              t[TASK_MODEL.date],
                              dateFilter?.[0],
                              dateFilter?.[1]
                          )
                        : true

                    const isInSearch = searchInput
                        ? t[TASK_MODEL.description].includes(searchInput)
                        : true
                    const isInPriority = priority
                        ? t[TASK_MODEL.effort] === priority.value
                        : true
                    return isInDate && isInSearch && isInPriority
                })
                if (filteredDate.length) filtered[date] = filteredDate
            })
        }
        return filtered
    }, [tasks, dateFilter, searchInput, priority])
    return (
        <>
            <FilterBar
                onSearchHandler={setSearchInput}
                onDateChangeHandler={setDateFilters}
                dateFilter={dateFilter}
                onPriorityHandler={setPriority}
            />
            <HomeTableHeader />
            <Container>
                <Row>
                    <Column start={2} span={10}>
                        <div>
                            {filteredTasks &&
                                Object.keys(filteredTasks)?.map(date => (
                                    <div key={date}>
                                        <div>
                                            <div className={classes.section}>
                                                <div
                                                    key={date}
                                                    className={
                                                        classes.sectionHeading
                                                    }
                                                >
                                                    {dateRenderer(date)}
                                                </div>
                                                {filteredTasks[date]?.map(
                                                    (task, index) => (
                                                        <div key={task.id}>
                                                            <Task
                                                                task={task}
                                                                index={index}
                                                                isLast={
                                                                    tasks[date]
                                                                        ?.length -
                                                                        1 ===
                                                                    index
                                                                }
                                                                onDeleteCb={
                                                                    onDeleteTask
                                                                }
                                                                onUpdateCb={
                                                                    onEditTask
                                                                }
                                                                onEditCb={() => {
                                                                    setOpenedTask(
                                                                        task
                                                                    )
                                                                    setShowEditModal(
                                                                        true
                                                                    )
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </Column>
                </Row>
            </Container>
            {showEditModal && !isMobile && (
                <EditTaskModal
                    onClose={() => {
                        setShowEditModal(false)
                    }}
                    task={openedTask}
                />
            )}
        </>
    )
}

export default Completed
