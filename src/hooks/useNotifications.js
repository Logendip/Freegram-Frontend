import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";


export function useNotifications() {
    const [notifications, setNotifications] =
        useState([]);

    const timersRef =
        useRef(new Map());


    const removeNotification =
        useCallback((notificationId) => {
            setNotifications(
                (previousNotifications) =>
                    previousNotifications.filter(
                        (notification) =>
                            notification.id !==
                            notificationId
                    )
            );

            const timer =
                timersRef.current.get(
                    notificationId
                );

            if (timer) {
                clearTimeout(timer);
                timersRef.current.delete(
                    notificationId
                );
            }
        }, []);


    const notify =
        useCallback(
            ({
                type = "info",
                title = "Повідомлення",
                message,
                duration = 5000
            }) => {
                if (!message) {
                    return null;
                }

                const notificationId =
                    Date.now() +
                    Math.random();


                setNotifications(
                    (previousNotifications) => [
                        ...previousNotifications,
                        {
                            id:
                                notificationId,

                            type,

                            title,

                            message
                        }
                    ]
                );


                if (duration > 0) {
                    const timer =
                        setTimeout(() => {
                            setNotifications(
                                (previousNotifications) =>
                                    previousNotifications.filter(
                                        (notification) =>
                                            notification.id !==
                                            notificationId
                                    )
                            );

                            timersRef.current.delete(
                                notificationId
                            );
                        }, duration);


                    timersRef.current.set(
                        notificationId,
                        timer
                    );
                }


                return notificationId;
            },
            []
        );


    const clearNotifications =
        useCallback(() => {
            timersRef.current.forEach(
                (timer) => clearTimeout(timer)
            );

            timersRef.current.clear();

            setNotifications([]);
        }, []);


    useEffect(() => {
        return () => {
            timersRef.current.forEach(
                (timer) => clearTimeout(timer)
            );

            timersRef.current.clear();
        };
    }, []);


    return {
        notifications,
        notify,
        removeNotification,
        clearNotifications
    };
}