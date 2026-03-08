import { LegalLayout } from "@/components/layout/LegalLayout"

export function PolitykaPrywatnosciPage() {
  return (
    <LegalLayout title="Polityka Prywatności" lastUpdated="18 lutego 2026">
      <h2>1. Administrator danych</h2>
      <p>
        Administratorem Twoich danych osobowych jest <strong>Procurea sp. z o.o.</strong> z siedzibą w Bydgoszczy, ul. Pomorska 3/1, 85-050 Bydgoszcz (dalej: „Administrator" lub „my").
      </p>
      <p>
        Kontakt z Administratorem: <strong>kontakt@procurea.pl</strong>.
      </p>

      <h2>2. Jakie dane zbieramy</h2>
      <p>W ramach korzystania z Platformy Procurea zbieramy następujące kategorie danych:</p>
      <h3>2.1. Dane rejestracyjne</h3>
      <ul>
        <li>Imię i nazwisko (z konta Google lub Microsoft)</li>
        <li>Adres e-mail</li>
        <li>Numer telefonu (podany podczas weryfikacji)</li>
        <li>Zdjęcie profilowe (jeśli dostępne w koncie OAuth)</li>
      </ul>
      <h3>2.2. Dane organizacyjne</h3>
      <ul>
        <li>Nazwa firmy / organizacji</li>
        <li>Stanowisko</li>
        <li>Branża</li>
        <li>NIP (opcjonalnie)</li>
      </ul>
      <h3>2.3. Dane generowane podczas korzystania z Platformy</h3>
      <ul>
        <li>Zapytania sourcingowe i ich parametry</li>
        <li>Wyniki wyszukiwań i lista dostawców</li>
        <li>Korespondencja z dostawcami (sekwencje email)</li>
        <li>Zapytania ofertowe (RFQ) i złożone oferty</li>
        <li>Logi aktywności i historię operacji</li>
      </ul>
      <h3>2.4. Dane techniczne</h3>
      <ul>
        <li>Adres IP</li>
        <li>Typ przeglądarki i systemu operacyjnego</li>
        <li>Identyfikatory sesji</li>
        <li>Dane z plików cookies (szczegóły w sekcji 7)</li>
      </ul>

      <h2>3. Cele przetwarzania danych</h2>
      <p>Twoje dane osobowe przetwarzamy w następujących celach:</p>
      <ul>
        <li><strong>Świadczenie usług</strong> — realizacja funkcjonalności Platformy, w tym uruchamianie procesów sourcingu AI, wysyłanie zapytań ofertowych i sekwencji email (podstawa: art. 6 ust. 1 lit. b RODO — wykonanie umowy).</li>
        <li><strong>Rejestracja i obsługa Konta</strong> — uwierzytelnianie, weryfikacja tożsamości (podstawa: art. 6 ust. 1 lit. b RODO).</li>
        <li><strong>Rozliczenia i fakturowanie</strong> — obsługa płatności za Kredyty (podstawa: art. 6 ust. 1 lit. b i c RODO).</li>
        <li><strong>Komunikacja</strong> — odpowiadanie na zapytania, obsługa reklamacji, powiadomienia systemowe (podstawa: art. 6 ust. 1 lit. b i f RODO).</li>
        <li><strong>Bezpieczeństwo</strong> — ochrona przed nieautoryzowanym dostępem, zapobieganie nadużyciom (podstawa: art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes).</li>
        <li><strong>Analityka i ulepszanie usług</strong> — analiza sposobu korzystania z Platformy w celu poprawy jej funkcjonalności (podstawa: art. 6 ust. 1 lit. f RODO).</li>
      </ul>

      <h2>4. Udostępnianie danych</h2>
      <p>Twoje dane mogą być udostępniane następującym kategoriom odbiorców:</p>
      <ul>
        <li><strong>Dostawcy usług IT</strong> — Google Cloud Platform (hosting, bazy danych), Firebase (uwierzytelnianie), w zakresie niezbędnym do świadczenia usług.</li>
        <li><strong>Dostawcy usług komunikacyjnych</strong> — serwisy do wysyłki SMS (weryfikacja telefonu) i email (sekwencje).</li>
        <li><strong>Dostawcy wyszukanym przez Platformę</strong> — dane kontaktowe Użytkownika mogą być widoczne w zapytaniach ofertowych wysyłanych do dostawców.</li>
        <li><strong>Organy państwowe</strong> — na podstawie obowiązujących przepisów prawa, na żądanie uprawnionych organów.</li>
      </ul>
      <p>
        Nie sprzedajemy danych osobowych podmiotom trzecim. Nie udostępniamy danych w celach marketingowych osobom trzecim.
      </p>

      <h2>5. Przekazywanie danych poza EOG</h2>
      <p>
        Dane Użytkowników przechowywane są na serwerach Google Cloud w regionie <strong>europe-west1</strong> (Belgia, UE). Co do zasady dane nie opuszczają Europejskiego Obszaru Gospodarczego.
      </p>
      <p>
        W przypadku korzystania z usług podmiotów mających siedzibę poza EOG (np. usługi AI), stosujemy odpowiednie zabezpieczenia, w tym standardowe klauzule umowne zatwierdzone przez Komisję Europejską.
      </p>

      <h2>6. Okres przechowywania danych</h2>
      <ul>
        <li><strong>Dane konta</strong> — przez cały okres posiadania aktywnego Konta i przez 30 dni po jego usunięciu.</li>
        <li><strong>Dane rozliczeniowe</strong> — przez okres wymagany przepisami prawa podatkowego (5 lat).</li>
        <li><strong>Dane analityczne</strong> — w formie zanonimizowanej, bezterminowo.</li>
        <li><strong>Logi systemowe</strong> — do 12 miesięcy.</li>
      </ul>

      <h2>7. Pliki cookies</h2>
      <p>Platforma wykorzystuje pliki cookies w następujących celach:</p>
      <ul>
        <li><strong>Cookies niezbędne</strong> — wymagane do prawidłowego działania Platformy (sesja, uwierzytelnianie).</li>
        <li><strong>Cookies analityczne</strong> — zbieranie anonimowych statystyk dotyczących korzystania z Platformy (PostHog).</li>
      </ul>
      <p>
        Użytkownik może zarządzać ustawieniami cookies w swojej przeglądarce. Wyłączenie cookies niezbędnych może ograniczyć funkcjonalność Platformy.
      </p>

      <h2>8. Twoje prawa</h2>
      <p>W związku z przetwarzaniem danych osobowych przysługują Ci następujące prawa:</p>
      <ul>
        <li><strong>Prawo dostępu</strong> — uzyskanie informacji o przetwarzanych danych (art. 15 RODO).</li>
        <li><strong>Prawo do sprostowania</strong> — poprawienie nieprawidłowych danych (art. 16 RODO).</li>
        <li><strong>Prawo do usunięcia</strong> — żądanie usunięcia danych, tzw. „prawo do bycia zapomnianym" (art. 17 RODO).</li>
        <li><strong>Prawo do ograniczenia przetwarzania</strong> (art. 18 RODO).</li>
        <li><strong>Prawo do przenoszenia danych</strong> — otrzymanie danych w ustrukturyzowanym formacie (art. 20 RODO).</li>
        <li><strong>Prawo do sprzeciwu</strong> — wobec przetwarzania na podstawie prawnie uzasadnionego interesu (art. 21 RODO).</li>
        <li><strong>Prawo do wniesienia skargi</strong> — do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).</li>
      </ul>
      <p>
        Aby skorzystać z powyższych praw, skontaktuj się z nami: <strong>kontakt@procurea.pl</strong>.
      </p>

      <h2>9. Bezpieczeństwo danych</h2>
      <p>Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony danych osobowych, w tym:</p>
      <ul>
        <li>Szyfrowanie danych w transmisji (TLS/SSL) i w spoczynku</li>
        <li>Uwierzytelnianie OAuth 2.0 z dostawcami tożsamości (Google, Microsoft)</li>
        <li>Weryfikacja dwuetapowa (SMS)</li>
        <li>Regularne kopie zapasowe</li>
        <li>Kontrola dostępu oparta na rolach</li>
        <li>Monitorowanie i logowanie aktywności</li>
      </ul>

      <h2>10. Zmiany Polityki Prywatności</h2>
      <p>
        Zastrzegamy sobie prawo do aktualizacji niniejszej Polityki Prywatności. O istotnych zmianach poinformujemy Użytkowników drogą elektroniczną. Aktualna wersja jest zawsze dostępna na stronie procurea.pl.
      </p>

      <h2>Dane kontaktowe</h2>
      <p>
        <strong>Procurea sp. z o.o.</strong><br />
        ul. Pomorska 3/1, 85-050 Bydgoszcz<br />
        E-mail: kontakt@procurea.pl
      </p>
    </LegalLayout>
  )
}
