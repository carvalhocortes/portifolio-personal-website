import i18n from '../../../shared/i18n';

export const about = (): string => {
  const myAge = (() => {
    const today = new Date();
    const birthDate = new Date(1984, 1, 7); // Month is 0-indexed (1 = February)
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    // Verifica se o aniversário ainda não aconteceu este ano para corrigir a idade
    // Se o mês de nascimento ainda não chegou OU se estamos no mês do aniversário mas o dia ainda não chegou
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  })();

  return `
## ${i18n.t('about.greeting')}

${i18n.t('about.intro', { age: myAge })}

${i18n.t('about.education')}

${i18n.t('about.telecoms')}

${i18n.t('about.career')}

${i18n.t('about.skills')}

${i18n.t('about.goal')}

### ${i18n.t('about.contactTitle')}
[![fernando@carvalhocortes.com.br](https://img.shields.io/badge/fernando%40carvalhocortes.com.br-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:fernando@carvalhocortes.com.br)
[![linkedin.com/in/carvalhocortes](https://img.shields.io/badge/linkedin.com%2Fin%2Fcarvalhocortes-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/carvalhocortes/)
[![@carvalhocortes](https://img.shields.io/badge/@carvalhocortes-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/carvalhocortes/)
`;
};
