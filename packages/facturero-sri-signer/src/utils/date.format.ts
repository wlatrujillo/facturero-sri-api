
export class DateFormat {


    static formatDateDDMMYYYY(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}${month}${year}`;
    }

    static formatDateYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static formatDateDDMM(date: Date): string {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}${month}`;
    }

    static formatDate(date: Date): string {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' } as const;
        return date.toLocaleDateString('en-GB', options);
    }

}