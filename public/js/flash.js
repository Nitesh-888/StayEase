document.querySelectorAll('.alert').forEach((alert) => {
  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
    bsAlert.close();
  }, 3000); // 3 seconds
});
