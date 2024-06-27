import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Notification = ({message, type}) => {

    const [isVisible, setIsVisible] = useState(false);  

    const showNotification = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 2000); // 2 seconds
    };

    useEffect(() => {
      if (message) {
        showNotification();
      }
    }, [message]);
  
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
      padding: '10px 20px',
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
  }
  
  export default Notification