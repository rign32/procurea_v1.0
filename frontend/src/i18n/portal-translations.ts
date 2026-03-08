// Portal translations for supplier-facing pages
// Detected from supplier's country, changeable via language picker

export interface PortalTranslations {
  steps: {
    rfqReview: string;
    pricing: string;
    alternative: string;
    confirm: string;
    success: string;
  };
  rfq: {
    title: string;
    product: string;
    quantity: string;
    material: string;
    eau: string;
    category: string;
    partNumber: string;
    description: string;
    incoterms: string;
    deliveryDate: string;
    deliveryLocation: string;
    currency: string;
    unit: string;
    attachments: string;
    downloadAttachment: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    addTier: string;
    removeTier: string;
    from: string;
    to: string;
    andAbove: string;
    unitPrice: string;
    currency: string;
    moq: string;
    moqPlaceholder: string;
    leadTime: string;
    leadTimePlaceholder: string;
    leadTimeUnit: string;
    validityDate: string;
  };
  alternative: {
    title: string;
    subtitle: string;
    toggle: string;
    description: string;
    descriptionPlaceholder: string;
    material: string;
    materialPlaceholder: string;
  };
  confirm: {
    title: string;
    subtitle: string;
    specsConfirmed: string;
    incotermsConfirmed: string;
    comments: string;
    commentsPlaceholder: string;
    summary: string;
    mainOffer: string;
    alternativeOffer: string;
    submit: string;
    submitting: string;
  };
  success: {
    title: string;
    message: string;
    offerSummary: string;
  };
  common: {
    next: string;
    back: string;
    required: string;
    optional: string;
    step: string;
    of: string;
    poweredBy: string;
  };
  errors: {
    priceRequired: string;
    minQtyRequired: string;
    invalidPrice: string;
    tierOverlap: string;
    altDescriptionRequired: string;
    altTiersRequired: string;
    submitFailed: string;
    notFound: string;
    notFoundMessage: string;
    alreadySubmitted: string;
    alreadySubmittedMessage: string;
  };
  status: {
    pending: string;
    viewed: string;
    submitted: string;
    accepted: string;
    rejected: string;
  };
}

const pl: PortalTranslations = {
  steps: {
    rfqReview: 'Zapytanie ofertowe',
    pricing: 'Oferta cenowa',
    alternative: 'Alternatywa',
    confirm: 'Potwierdzenie',
    success: 'Gotowe',
  },
  rfq: {
    title: 'Szczegóły zapytania ofertowego',
    product: 'Produkt',
    quantity: 'Ilość',
    material: 'Materiał',
    eau: 'Roczne zużycie (EAU)',
    category: 'Kategoria',
    partNumber: 'Numer katalogowy',
    description: 'Opis',
    incoterms: 'Incoterms',
    deliveryDate: 'Pożądana data dostawy',
    deliveryLocation: 'Miejsce dostawy',
    currency: 'Waluta',
    unit: 'Jednostka',
    attachments: 'Załączniki',
    downloadAttachment: 'Pobierz',
  },
  pricing: {
    title: 'Twoja oferta cenowa',
    subtitle: 'Podaj ceny w zależności od ilości zamówienia',
    addTier: 'Dodaj próg',
    removeTier: 'Usuń',
    from: 'Od',
    to: 'Do',
    andAbove: 'i więcej',
    unitPrice: 'Cena/szt.',
    currency: 'Waluta',
    moq: 'Minimalna ilość zamówienia (MOQ)',
    moqPlaceholder: 'np. 100',
    leadTime: 'Czas realizacji',
    leadTimePlaceholder: 'np. 4',
    leadTimeUnit: 'tygodni',
    validityDate: 'Oferta ważna do',
  },
  alternative: {
    title: 'Oferta alternatywna',
    subtitle: 'Opcjonalnie zaproponuj alternatywne rozwiązanie',
    toggle: 'Chcę zaproponować alternatywę',
    description: 'Opis alternatywy',
    descriptionPlaceholder: 'Np. "Proponujemy aluminium 7075 zamiast 6061, co zapewnia lepszą wytrzymałość..."',
    material: 'Alternatywny materiał',
    materialPlaceholder: 'np. aluminium 7075',
  },
  confirm: {
    title: 'Potwierdzenie i wysyłka',
    subtitle: 'Przejrzyj swoją ofertę przed wysłaniem',
    specsConfirmed: 'Potwierdzam zgodność ze specyfikacją techniczną',
    incotermsConfirmed: 'Akceptuję warunki Incoterms',
    comments: 'Dodatkowe uwagi',
    commentsPlaceholder: 'Warunki specjalne, uwagi do oferty...',
    summary: 'Podsumowanie oferty',
    mainOffer: 'Oferta główna',
    alternativeOffer: 'Oferta alternatywna',
    submit: 'Złóż ofertę',
    submitting: 'Wysyłanie...',
  },
  success: {
    title: 'Dziękujemy za złożenie oferty!',
    message: 'Twoja oferta została przesłana. Skontaktujemy się z Tobą w sprawie dalszych kroków.',
    offerSummary: 'Podsumowanie złożonej oferty',
  },
  common: {
    next: 'Dalej',
    back: 'Wstecz',
    required: 'Wymagane',
    optional: 'Opcjonalne',
    step: 'Krok',
    of: 'z',
    poweredBy: 'Powered by Procurea',
  },
  errors: {
    priceRequired: 'Cena jest wymagana',
    minQtyRequired: 'Minimalna ilość jest wymagana',
    invalidPrice: 'Cena musi być większa od 0',
    tierOverlap: 'Zakresy ilościowe nie mogą się nakładać',
    altDescriptionRequired: 'Opis alternatywy jest wymagany',
    altTiersRequired: 'Alternatywa musi zawierać przynajmniej jeden próg cenowy',
    submitFailed: 'Błąd wysyłania oferty. Spróbuj ponownie.',
    notFound: 'Nie znaleziono oferty',
    notFoundMessage: 'Link jest nieprawidłowy lub wygasł.',
    alreadySubmitted: 'Oferta już złożona',
    alreadySubmittedMessage: 'Ta oferta została już przesłana i nie może być ponownie edytowana.',
  },
  status: {
    pending: 'Oczekująca',
    viewed: 'Obejrzana',
    submitted: 'Złożona',
    accepted: 'Zaakceptowana',
    rejected: 'Odrzucona',
  },
};

const en: PortalTranslations = {
  steps: {
    rfqReview: 'RFQ Details',
    pricing: 'Pricing',
    alternative: 'Alternative',
    confirm: 'Confirmation',
    success: 'Done',
  },
  rfq: {
    title: 'Request for Quotation Details',
    product: 'Product',
    quantity: 'Quantity',
    material: 'Material',
    eau: 'Estimated Annual Usage (EAU)',
    category: 'Category',
    partNumber: 'Part Number',
    description: 'Description',
    incoterms: 'Incoterms',
    deliveryDate: 'Desired Delivery Date',
    deliveryLocation: 'Delivery Location',
    currency: 'Currency',
    unit: 'Unit',
    attachments: 'Attachments',
    downloadAttachment: 'Download',
  },
  pricing: {
    title: 'Your Price Offer',
    subtitle: 'Provide pricing based on order quantity',
    addTier: 'Add tier',
    removeTier: 'Remove',
    from: 'From',
    to: 'To',
    andAbove: 'and above',
    unitPrice: 'Unit price',
    currency: 'Currency',
    moq: 'Minimum Order Quantity (MOQ)',
    moqPlaceholder: 'e.g. 100',
    leadTime: 'Lead Time',
    leadTimePlaceholder: 'e.g. 4',
    leadTimeUnit: 'weeks',
    validityDate: 'Offer valid until',
  },
  alternative: {
    title: 'Alternative Offer',
    subtitle: 'Optionally propose an alternative solution',
    toggle: 'I want to propose an alternative',
    description: 'Alternative Description',
    descriptionPlaceholder: 'E.g. "We propose aluminium 7075 instead of 6061, which provides better durability..."',
    material: 'Alternative Material',
    materialPlaceholder: 'e.g. aluminium 7075',
  },
  confirm: {
    title: 'Confirmation & Submit',
    subtitle: 'Review your offer before submitting',
    specsConfirmed: 'I confirm compliance with the technical specification',
    incotermsConfirmed: 'I accept the Incoterms conditions',
    comments: 'Additional Notes',
    commentsPlaceholder: 'Special conditions, notes about the offer...',
    summary: 'Offer Summary',
    mainOffer: 'Main Offer',
    alternativeOffer: 'Alternative Offer',
    submit: 'Submit Offer',
    submitting: 'Submitting...',
  },
  success: {
    title: 'Thank you for your offer!',
    message: 'Your offer has been submitted. We will contact you regarding the next steps.',
    offerSummary: 'Submitted offer summary',
  },
  common: {
    next: 'Next',
    back: 'Back',
    required: 'Required',
    optional: 'Optional',
    step: 'Step',
    of: 'of',
    poweredBy: 'Powered by Procurea',
  },
  errors: {
    priceRequired: 'Price is required',
    minQtyRequired: 'Minimum quantity is required',
    invalidPrice: 'Price must be greater than 0',
    tierOverlap: 'Quantity ranges must not overlap',
    altDescriptionRequired: 'Alternative description is required',
    altTiersRequired: 'Alternative must have at least one price tier',
    submitFailed: 'Failed to submit offer. Please try again.',
    notFound: 'Offer not found',
    notFoundMessage: 'The link is invalid or has expired.',
    alreadySubmitted: 'Offer already submitted',
    alreadySubmittedMessage: 'This offer has already been submitted and cannot be edited.',
  },
  status: {
    pending: 'Pending',
    viewed: 'Viewed',
    submitted: 'Submitted',
    accepted: 'Accepted',
    rejected: 'Rejected',
  },
};

const de: PortalTranslations = {
  steps: {
    rfqReview: 'Angebotsanfrage',
    pricing: 'Preisangebot',
    alternative: 'Alternative',
    confirm: 'Bestätigung',
    success: 'Fertig',
  },
  rfq: {
    title: 'Details der Angebotsanfrage',
    product: 'Produkt',
    quantity: 'Menge',
    material: 'Material',
    eau: 'Geschätzter Jahresverbrauch (EAU)',
    category: 'Kategorie',
    partNumber: 'Teilenummer',
    description: 'Beschreibung',
    incoterms: 'Incoterms',
    deliveryDate: 'Gewünschtes Lieferdatum',
    deliveryLocation: 'Lieferort',
    currency: 'Währung',
    unit: 'Einheit',
    attachments: 'Anhänge',
    downloadAttachment: 'Herunterladen',
  },
  pricing: {
    title: 'Ihr Preisangebot',
    subtitle: 'Preise basierend auf der Bestellmenge angeben',
    addTier: 'Staffel hinzufügen',
    removeTier: 'Entfernen',
    from: 'Von',
    to: 'Bis',
    andAbove: 'und mehr',
    unitPrice: 'Stückpreis',
    currency: 'Währung',
    moq: 'Mindestbestellmenge (MOQ)',
    moqPlaceholder: 'z.B. 100',
    leadTime: 'Lieferzeit',
    leadTimePlaceholder: 'z.B. 4',
    leadTimeUnit: 'Wochen',
    validityDate: 'Angebot gültig bis',
  },
  alternative: {
    title: 'Alternativangebot',
    subtitle: 'Optional eine alternative Lösung vorschlagen',
    toggle: 'Ich möchte eine Alternative vorschlagen',
    description: 'Beschreibung der Alternative',
    descriptionPlaceholder: 'Z.B. "Wir schlagen Aluminium 7075 statt 6061 vor, was eine bessere Haltbarkeit bietet..."',
    material: 'Alternatives Material',
    materialPlaceholder: 'z.B. Aluminium 7075',
  },
  confirm: {
    title: 'Bestätigung & Absenden',
    subtitle: 'Überprüfen Sie Ihr Angebot vor dem Absenden',
    specsConfirmed: 'Ich bestätige die Übereinstimmung mit der technischen Spezifikation',
    incotermsConfirmed: 'Ich akzeptiere die Incoterms-Bedingungen',
    comments: 'Zusätzliche Anmerkungen',
    commentsPlaceholder: 'Besondere Bedingungen, Anmerkungen zum Angebot...',
    summary: 'Angebotszusammenfassung',
    mainOffer: 'Hauptangebot',
    alternativeOffer: 'Alternativangebot',
    submit: 'Angebot abgeben',
    submitting: 'Wird gesendet...',
  },
  success: {
    title: 'Vielen Dank für Ihr Angebot!',
    message: 'Ihr Angebot wurde übermittelt. Wir werden Sie bezüglich der nächsten Schritte kontaktieren.',
    offerSummary: 'Zusammenfassung des eingereichten Angebots',
  },
  common: {
    next: 'Weiter',
    back: 'Zurück',
    required: 'Erforderlich',
    optional: 'Optional',
    step: 'Schritt',
    of: 'von',
    poweredBy: 'Powered by Procurea',
  },
  errors: {
    priceRequired: 'Preis ist erforderlich',
    minQtyRequired: 'Mindestmenge ist erforderlich',
    invalidPrice: 'Preis muss größer als 0 sein',
    tierOverlap: 'Mengenbereiche dürfen sich nicht überschneiden',
    altDescriptionRequired: 'Beschreibung der Alternative ist erforderlich',
    altTiersRequired: 'Alternative muss mindestens eine Preisstufe haben',
    submitFailed: 'Angebot konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    notFound: 'Angebot nicht gefunden',
    notFoundMessage: 'Der Link ist ungültig oder abgelaufen.',
    alreadySubmitted: 'Angebot bereits eingereicht',
    alreadySubmittedMessage: 'Dieses Angebot wurde bereits eingereicht und kann nicht bearbeitet werden.',
  },
  status: {
    pending: 'Ausstehend',
    viewed: 'Angesehen',
    submitted: 'Eingereicht',
    accepted: 'Akzeptiert',
    rejected: 'Abgelehnt',
  },
};

const fr: PortalTranslations = {
  steps: {
    rfqReview: 'Demande de devis',
    pricing: 'Offre de prix',
    alternative: 'Alternative',
    confirm: 'Confirmation',
    success: 'Terminé',
  },
  rfq: {
    title: 'Détails de la demande de devis',
    product: 'Produit',
    quantity: 'Quantité',
    material: 'Matériau',
    eau: 'Consommation annuelle estimée (EAU)',
    category: 'Catégorie',
    partNumber: 'Numéro de pièce',
    description: 'Description',
    incoterms: 'Incoterms',
    deliveryDate: 'Date de livraison souhaitée',
    deliveryLocation: 'Lieu de livraison',
    currency: 'Devise',
    unit: 'Unité',
    attachments: 'Pièces jointes',
    downloadAttachment: 'Télécharger',
  },
  pricing: {
    title: 'Votre offre de prix',
    subtitle: 'Indiquez les prix en fonction de la quantité commandée',
    addTier: 'Ajouter un palier',
    removeTier: 'Supprimer',
    from: 'De',
    to: 'À',
    andAbove: 'et plus',
    unitPrice: 'Prix unitaire',
    currency: 'Devise',
    moq: 'Quantité minimale de commande (MOQ)',
    moqPlaceholder: 'ex. 100',
    leadTime: 'Délai de livraison',
    leadTimePlaceholder: 'ex. 4',
    leadTimeUnit: 'semaines',
    validityDate: "Offre valable jusqu'au",
  },
  alternative: {
    title: 'Offre alternative',
    subtitle: 'Proposez éventuellement une solution alternative',
    toggle: 'Je souhaite proposer une alternative',
    description: "Description de l'alternative",
    descriptionPlaceholder: 'Ex. "Nous proposons l\'aluminium 7075 au lieu du 6061, offrant une meilleure résistance..."',
    material: 'Matériau alternatif',
    materialPlaceholder: 'ex. aluminium 7075',
  },
  confirm: {
    title: 'Confirmation et envoi',
    subtitle: "Vérifiez votre offre avant l'envoi",
    specsConfirmed: 'Je confirme la conformité avec la spécification technique',
    incotermsConfirmed: "J'accepte les conditions Incoterms",
    comments: 'Notes supplémentaires',
    commentsPlaceholder: "Conditions spéciales, remarques sur l'offre...",
    summary: "Résumé de l'offre",
    mainOffer: 'Offre principale',
    alternativeOffer: 'Offre alternative',
    submit: "Soumettre l'offre",
    submitting: 'Envoi en cours...',
  },
  success: {
    title: 'Merci pour votre offre !',
    message: 'Votre offre a été soumise. Nous vous contacterons pour les prochaines étapes.',
    offerSummary: "Résumé de l'offre soumise",
  },
  common: {
    next: 'Suivant',
    back: 'Retour',
    required: 'Requis',
    optional: 'Facultatif',
    step: 'Étape',
    of: 'sur',
    poweredBy: 'Powered by Procurea',
  },
  errors: {
    priceRequired: 'Le prix est requis',
    minQtyRequired: 'La quantité minimale est requise',
    invalidPrice: 'Le prix doit être supérieur à 0',
    tierOverlap: 'Les plages de quantités ne doivent pas se chevaucher',
    altDescriptionRequired: "La description de l'alternative est requise",
    altTiersRequired: "L'alternative doit avoir au moins un palier de prix",
    submitFailed: "Échec de l'envoi de l'offre. Veuillez réessayer.",
    notFound: 'Offre non trouvée',
    notFoundMessage: 'Le lien est invalide ou a expiré.',
    alreadySubmitted: 'Offre déjà soumise',
    alreadySubmittedMessage: 'Cette offre a déjà été soumise et ne peut pas être modifiée.',
  },
  status: {
    pending: 'En attente',
    viewed: 'Consultée',
    submitted: 'Soumise',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
  },
};

const es: PortalTranslations = {
  steps: {
    rfqReview: 'Solicitud de cotización',
    pricing: 'Oferta de precio',
    alternative: 'Alternativa',
    confirm: 'Confirmación',
    success: 'Listo',
  },
  rfq: {
    title: 'Detalles de la solicitud de cotización',
    product: 'Producto',
    quantity: 'Cantidad',
    material: 'Material',
    eau: 'Consumo anual estimado (EAU)',
    category: 'Categoría',
    partNumber: 'Número de pieza',
    description: 'Descripción',
    incoterms: 'Incoterms',
    deliveryDate: 'Fecha de entrega deseada',
    deliveryLocation: 'Lugar de entrega',
    currency: 'Moneda',
    unit: 'Unidad',
    attachments: 'Adjuntos',
    downloadAttachment: 'Descargar',
  },
  pricing: {
    title: 'Su oferta de precio',
    subtitle: 'Indique los precios según la cantidad del pedido',
    addTier: 'Agregar nivel',
    removeTier: 'Eliminar',
    from: 'Desde',
    to: 'Hasta',
    andAbove: 'y más',
    unitPrice: 'Precio unitario',
    currency: 'Moneda',
    moq: 'Cantidad mínima de pedido (MOQ)',
    moqPlaceholder: 'ej. 100',
    leadTime: 'Plazo de entrega',
    leadTimePlaceholder: 'ej. 4',
    leadTimeUnit: 'semanas',
    validityDate: 'Oferta válida hasta',
  },
  alternative: {
    title: 'Oferta alternativa',
    subtitle: 'Opcionalmente proponga una solución alternativa',
    toggle: 'Quiero proponer una alternativa',
    description: 'Descripción de la alternativa',
    descriptionPlaceholder: 'Ej. "Proponemos aluminio 7075 en lugar de 6061, que ofrece mayor resistencia..."',
    material: 'Material alternativo',
    materialPlaceholder: 'ej. aluminio 7075',
  },
  confirm: {
    title: 'Confirmación y envío',
    subtitle: 'Revise su oferta antes de enviarla',
    specsConfirmed: 'Confirmo la conformidad con la especificación técnica',
    incotermsConfirmed: 'Acepto las condiciones Incoterms',
    comments: 'Notas adicionales',
    commentsPlaceholder: 'Condiciones especiales, notas sobre la oferta...',
    summary: 'Resumen de la oferta',
    mainOffer: 'Oferta principal',
    alternativeOffer: 'Oferta alternativa',
    submit: 'Enviar oferta',
    submitting: 'Enviando...',
  },
  success: {
    title: '¡Gracias por su oferta!',
    message: 'Su oferta ha sido enviada. Le contactaremos respecto a los próximos pasos.',
    offerSummary: 'Resumen de la oferta enviada',
  },
  common: {
    next: 'Siguiente',
    back: 'Atrás',
    required: 'Requerido',
    optional: 'Opcional',
    step: 'Paso',
    of: 'de',
    poweredBy: 'Powered by Procurea',
  },
  errors: {
    priceRequired: 'El precio es requerido',
    minQtyRequired: 'La cantidad mínima es requerida',
    invalidPrice: 'El precio debe ser mayor que 0',
    tierOverlap: 'Los rangos de cantidad no deben superponerse',
    altDescriptionRequired: 'La descripción de la alternativa es requerida',
    altTiersRequired: 'La alternativa debe tener al menos un nivel de precio',
    submitFailed: 'Error al enviar la oferta. Inténtelo de nuevo.',
    notFound: 'Oferta no encontrada',
    notFoundMessage: 'El enlace es inválido o ha expirado.',
    alreadySubmitted: 'Oferta ya enviada',
    alreadySubmittedMessage: 'Esta oferta ya ha sido enviada y no puede ser editada.',
  },
  status: {
    pending: 'Pendiente',
    viewed: 'Vista',
    submitted: 'Enviada',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
  },
};

const it: PortalTranslations = {
  steps: {
    rfqReview: 'Richiesta di offerta',
    pricing: 'Offerta di prezzo',
    alternative: 'Alternativa',
    confirm: 'Conferma',
    success: 'Fatto',
  },
  rfq: {
    title: "Dettagli della richiesta di offerta",
    product: 'Prodotto',
    quantity: 'Quantità',
    material: 'Materiale',
    eau: 'Consumo annuo stimato (EAU)',
    category: 'Categoria',
    partNumber: 'Numero di parte',
    description: 'Descrizione',
    incoterms: 'Incoterms',
    deliveryDate: 'Data di consegna desiderata',
    deliveryLocation: 'Luogo di consegna',
    currency: 'Valuta',
    unit: 'Unità',
    attachments: 'Allegati',
    downloadAttachment: 'Scarica',
  },
  pricing: {
    title: 'La tua offerta di prezzo',
    subtitle: "Indica i prezzi in base alla quantità dell'ordine",
    addTier: 'Aggiungi livello',
    removeTier: 'Rimuovi',
    from: 'Da',
    to: 'A',
    andAbove: 'e oltre',
    unitPrice: 'Prezzo unitario',
    currency: 'Valuta',
    moq: "Quantità minima d'ordine (MOQ)",
    moqPlaceholder: 'es. 100',
    leadTime: 'Tempi di consegna',
    leadTimePlaceholder: 'es. 4',
    leadTimeUnit: 'settimane',
    validityDate: 'Offerta valida fino al',
  },
  alternative: {
    title: 'Offerta alternativa',
    subtitle: 'Proponi facoltativamente una soluzione alternativa',
    toggle: "Voglio proporre un'alternativa",
    description: "Descrizione dell'alternativa",
    descriptionPlaceholder: 'Es. "Proponiamo alluminio 7075 invece di 6061, che offre una migliore resistenza..."',
    material: 'Materiale alternativo',
    materialPlaceholder: 'es. alluminio 7075',
  },
  confirm: {
    title: 'Conferma e invio',
    subtitle: "Rivedi la tua offerta prima dell'invio",
    specsConfirmed: 'Confermo la conformità con la specifica tecnica',
    incotermsConfirmed: 'Accetto le condizioni Incoterms',
    comments: 'Note aggiuntive',
    commentsPlaceholder: "Condizioni speciali, note sull'offerta...",
    summary: "Riepilogo dell'offerta",
    mainOffer: 'Offerta principale',
    alternativeOffer: 'Offerta alternativa',
    submit: "Invia l'offerta",
    submitting: 'Invio in corso...',
  },
  success: {
    title: 'Grazie per la tua offerta!',
    message: 'La tua offerta è stata inviata. Ti contatteremo per i prossimi passi.',
    offerSummary: "Riepilogo dell'offerta inviata",
  },
  common: {
    next: 'Avanti',
    back: 'Indietro',
    required: 'Obbligatorio',
    optional: 'Facoltativo',
    step: 'Passo',
    of: 'di',
    poweredBy: 'Powered by Procurea',
  },
  errors: {
    priceRequired: 'Il prezzo è obbligatorio',
    minQtyRequired: 'La quantità minima è obbligatoria',
    invalidPrice: 'Il prezzo deve essere maggiore di 0',
    tierOverlap: 'Gli intervalli di quantità non devono sovrapporsi',
    altDescriptionRequired: "La descrizione dell'alternativa è obbligatoria",
    altTiersRequired: "L'alternativa deve avere almeno un livello di prezzo",
    submitFailed: "Invio dell'offerta non riuscito. Riprova.",
    notFound: 'Offerta non trovata',
    notFoundMessage: 'Il link non è valido o è scaduto.',
    alreadySubmitted: 'Offerta già inviata',
    alreadySubmittedMessage: 'Questa offerta è già stata inviata e non può essere modificata.',
  },
  status: {
    pending: 'In attesa',
    viewed: 'Visualizzata',
    submitted: 'Inviata',
    accepted: 'Accettata',
    rejected: 'Rifiutata',
  },
};

const zh: PortalTranslations = {
  steps: {
    rfqReview: '报价请求',
    pricing: '报价',
    alternative: '替代方案',
    confirm: '确认',
    success: '完成',
  },
  rfq: {
    title: '报价请求详情',
    product: '产品',
    quantity: '数量',
    material: '材料',
    eau: '预计年用量 (EAU)',
    category: '类别',
    partNumber: '零件号',
    description: '描述',
    incoterms: '国际贸易术语',
    deliveryDate: '期望交货日期',
    deliveryLocation: '交货地点',
    currency: '货币',
    unit: '单位',
    attachments: '附件',
    downloadAttachment: '下载',
  },
  pricing: {
    title: '您的报价',
    subtitle: '根据订购数量提供价格',
    addTier: '添加阶梯',
    removeTier: '删除',
    from: '从',
    to: '到',
    andAbove: '及以上',
    unitPrice: '单价',
    currency: '货币',
    moq: '最小起订量 (MOQ)',
    moqPlaceholder: '例如 100',
    leadTime: '交货期',
    leadTimePlaceholder: '例如 4',
    leadTimeUnit: '周',
    validityDate: '报价有效期至',
  },
  alternative: {
    title: '替代报价',
    subtitle: '可选择提供替代方案',
    toggle: '我想提供替代方案',
    description: '替代方案描述',
    descriptionPlaceholder: '例如："我们建议使用7075铝合金代替6061，提供更好的耐久性..."',
    material: '替代材料',
    materialPlaceholder: '例如 7075铝合金',
  },
  confirm: {
    title: '确认并提交',
    subtitle: '提交前请检查您的报价',
    specsConfirmed: '我确认符合技术规格',
    incotermsConfirmed: '我接受国际贸易术语条件',
    comments: '附加说明',
    commentsPlaceholder: '特殊条件、报价备注...',
    summary: '报价摘要',
    mainOffer: '主要报价',
    alternativeOffer: '替代报价',
    submit: '提交报价',
    submitting: '提交中...',
  },
  success: {
    title: '感谢您的报价！',
    message: '您的报价已提交。我们将就后续步骤与您联系。',
    offerSummary: '已提交报价摘要',
  },
  common: {
    next: '下一步',
    back: '返回',
    required: '必填',
    optional: '选填',
    step: '步骤',
    of: '/',
    poweredBy: 'Powered by Procurea',
  },
  errors: {
    priceRequired: '价格为必填项',
    minQtyRequired: '最小数量为必填项',
    invalidPrice: '价格必须大于0',
    tierOverlap: '数量范围不能重叠',
    altDescriptionRequired: '替代方案描述为必填项',
    altTiersRequired: '替代方案必须至少有一个价格阶梯',
    submitFailed: '提交报价失败，请重试。',
    notFound: '未找到报价',
    notFoundMessage: '链接无效或已过期。',
    alreadySubmitted: '报价已提交',
    alreadySubmittedMessage: '此报价已提交，无法编辑。',
  },
  status: {
    pending: '待处理',
    viewed: '已查看',
    submitted: '已提交',
    accepted: '已接受',
    rejected: '已拒绝',
  },
};

export const PORTAL_TRANSLATIONS: Record<string, PortalTranslations> = {
  pl, en, de, fr, es, it, zh,
};

export const SUPPORTED_PORTAL_LANGUAGES = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'zh', label: '中文' },
];

export function getPortalTranslations(langCode: string): PortalTranslations {
  return PORTAL_TRANSLATIONS[langCode] || PORTAL_TRANSLATIONS['en'];
}
