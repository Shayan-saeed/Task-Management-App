export const getInitials = (fullName: string): string => {
    const names = fullName.split(' ');
    if (names.length < 2) return fullName.charAt(0).toUpperCase(); 
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials;
  };
  