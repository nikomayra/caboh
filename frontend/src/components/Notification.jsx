import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const Notification = ({message, type, timer=2500}) => {

    const [isVisible, setIsVisible] = useState(false);  

    const showNotification = useCallback(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, timer); // 2.5 seconds
    }, [timer]);

    useEffect(() => {
      if (message) {
        showNotification();
      }
    }, [message, showNotification]);
  
    const getNotificationStyle = (type) => {
      switch (type) {
        case 'success':
          return { ...styles.notificationContent, backgroundColor: '#4caf50' };
        case 'error':
          return { ...styles.notificationContent, backgroundColor: '#f44336' };
        default:
          return { ...styles.notificationContent, backgroundColor: '#2196f3' };
      }
    };
  
    return (
      <>
        {isVisible && (
          <div style={styles.notification}>
            <div style={getNotificationStyle(type)}>
              <p>{message}</p>
            </div>
          </div>
        )}
      </>
    );

  }

  const styles = {
    notification: {
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 1000,
    },
    notificationContent: {
      backgroundColor: '#fefefe',
      margin: 'auto',
      padding: '5px 5px',
      border: '1px solid #888',
      borderRadius: '5px',
      textAlign: 'center',
      color: 'white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  };

  Notification.propTypes = {
    notification: PropTypes.object,
    message: PropTypes.string,
    type: PropTypes.string,
    timer: PropTypes.number,
  }
  
  export default Notification