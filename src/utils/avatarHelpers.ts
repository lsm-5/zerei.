/**
 * Gera iniciais a partir de um nome
 * @param name - Nome completo do usuário
 * @returns Iniciais (máximo 2 caracteres)
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') {
    return '?';
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return '?';
  }

  const words = trimmedName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 1) {
    // Uma palavra: primeira e segunda letra
    const word = words[0];
    if (word.length >= 2) {
      return (word.charAt(0) + word.charAt(1)).toUpperCase();
    } else {
      return word.charAt(0).toUpperCase();
    }
  } else {
    // Duas ou mais palavras: primeira letra do nome e primeira letra do sobrenome
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
};

/**
 * Gera avatar URL usando DiceBear com seed baseado no nome ou email
 * @param name - Nome do usuário
 * @param email - Email do usuário (fallback)
 * @returns URL do avatar
 */
export const getAvatarUrl = (name?: string | null, email?: string | null): string => {
  const seed = name || email || 'default';
  return `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(seed)}`;
};

/**
 * Obtém nome para exibição (nome ou email como fallback)
 * @param name - Nome do usuário
 * @param email - Email do usuário
 * @returns Nome para exibição
 */
export const getDisplayName = (name?: string | null, email?: string | null): string => {
  if (name && name.trim()) {
    return name.trim();
  }
  if (email && email.trim()) {
    return email.trim();
  }
  return 'Usuário Desconhecido';
};
