import { LegalLayout } from "@/components/layout/LegalLayout"

export function RodoPage() {
  return (
    <LegalLayout title="Klauzula informacyjna RODO" lastUpdated="18 lutego 2026">
      <p>
        Zgodnie z art. 13 ust. 1 i 2 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych, dalej: „RODO"), informujemy:
      </p>

      <h2>1. Administrator danych osobowych</h2>
      <p>
        Administratorem Pani/Pana danych osobowych jest <strong>Procurea sp. z o.o.</strong> z siedzibą w Bydgoszczy, ul. Pomorska 3/1, 85-050 Bydgoszcz.
      </p>
      <p>
        Kontakt z Administratorem: <strong>kontakt@procurea.pl</strong>.
      </p>

      <h2>2. Cele i podstawy prawne przetwarzania</h2>
      <p>Pani/Pana dane osobowe przetwarzane są w następujących celach:</p>

      <table>
        <thead>
          <tr>
            <th>Cel przetwarzania</th>
            <th>Podstawa prawna</th>
            <th>Okres przechowywania</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rejestracja i obsługa Konta w Platformie</td>
            <td>Art. 6 ust. 1 lit. b RODO (wykonanie umowy)</td>
            <td>Do czasu usunięcia Konta + 30 dni</td>
          </tr>
          <tr>
            <td>Świadczenie usług sourcingu AI</td>
            <td>Art. 6 ust. 1 lit. b RODO (wykonanie umowy)</td>
            <td>Do czasu usunięcia Konta + 30 dni</td>
          </tr>
          <tr>
            <td>Wysyłka zapytań ofertowych i sekwencji email do dostawców w imieniu Użytkownika</td>
            <td>Art. 6 ust. 1 lit. b RODO (wykonanie umowy)</td>
            <td>Do czasu usunięcia Konta + 30 dni</td>
          </tr>
          <tr>
            <td>Rozliczenia i fakturowanie</td>
            <td>Art. 6 ust. 1 lit. c RODO (obowiązek prawny)</td>
            <td>5 lat od końca roku podatkowego</td>
          </tr>
          <tr>
            <td>Obsługa zapytań i reklamacji</td>
            <td>Art. 6 ust. 1 lit. b i f RODO</td>
            <td>Do czasu rozwiązania sprawy + 12 miesięcy</td>
          </tr>
          <tr>
            <td>Bezpieczeństwo Platformy i zapobieganie nadużyciom</td>
            <td>Art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes)</td>
            <td>Do 12 miesięcy (logi)</td>
          </tr>
          <tr>
            <td>Analityka i ulepszanie usług</td>
            <td>Art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes)</td>
            <td>Dane zanonimizowane — bezterminowo</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Kategorie danych</h2>
      <p>Przetwarzamy następujące kategorie danych osobowych:</p>
      <ul>
        <li>Dane identyfikacyjne: imię, nazwisko, adres e-mail, numer telefonu</li>
        <li>Dane organizacyjne: nazwa firmy, stanowisko, branża, NIP</li>
        <li>Dane dotyczące korzystania z Platformy: zapytania sourcingowe, wyniki, korespondencja z dostawcami</li>
        <li>Dane techniczne: adres IP, identyfikatory sesji, dane przeglądarki</li>
      </ul>

      <h2>4. Odbiorcy danych</h2>
      <p>Pani/Pana dane mogą być udostępniane następującym kategoriom odbiorców:</p>
      <ul>
        <li><strong>Google Cloud Platform / Firebase</strong> — dostawca infrastruktury IT (hosting, bazy danych, uwierzytelnianie). Dane przechowywane w regionie europe-west1 (UE).</li>
        <li><strong>Dostawcy usług komunikacyjnych</strong> — w zakresie wysyłki SMS (weryfikacja) i email (sekwencje, powiadomienia).</li>
        <li><strong>Dostawcy kontaktowani przez Platformę</strong> — w zakresie danych kontaktowych Użytkownika umieszczonych w zapytaniach ofertowych.</li>
        <li><strong>Organy państwowe</strong> — w przypadkach przewidzianych prawem.</li>
      </ul>

      <h2>5. Przekazywanie danych do państw trzecich</h2>
      <p>
        Co do zasady dane osobowe są przechowywane i przetwarzane wyłącznie na terenie Europejskiego Obszaru Gospodarczego (EOG), na serwerach Google Cloud w regionie europe-west1 (Belgia).
      </p>
      <p>
        W przypadku konieczności przekazania danych poza EOG, stosowane są odpowiednie zabezpieczenia zgodne z rozdziałem V RODO, w szczególności standardowe klauzule umowne przyjęte przez Komisję Europejską.
      </p>

      <h2>6. Prawa osoby, której dane dotyczą</h2>
      <p>Na podstawie RODO przysługują Pani/Panu następujące prawa:</p>
      <ol>
        <li><strong>Prawo dostępu do danych</strong> (art. 15 RODO) — uzyskanie potwierdzenia przetwarzania danych oraz dostępu do nich.</li>
        <li><strong>Prawo do sprostowania danych</strong> (art. 16 RODO) — żądanie poprawienia nieprawidłowych lub uzupełnienia niekompletnych danych.</li>
        <li><strong>Prawo do usunięcia danych</strong> (art. 17 RODO) — żądanie usunięcia danych (tzw. „prawo do bycia zapomnianym"), gdy:
          <ul>
            <li>dane nie są już niezbędne do celów, w których zostały zebrane,</li>
            <li>cofnięto zgodę i nie ma innej podstawy prawnej przetwarzania,</li>
            <li>wniesiono skuteczny sprzeciw wobec przetwarzania.</li>
          </ul>
        </li>
        <li><strong>Prawo do ograniczenia przetwarzania</strong> (art. 18 RODO).</li>
        <li><strong>Prawo do przenoszenia danych</strong> (art. 20 RODO) — otrzymanie danych w ustrukturyzowanym, powszechnie używanym formacie nadającym się do odczytu maszynowego.</li>
        <li><strong>Prawo do sprzeciwu</strong> (art. 21 RODO) — wobec przetwarzania opartego na prawnie uzasadnionym interesie Administratora.</li>
        <li><strong>Prawo do cofnięcia zgody</strong> (art. 7 ust. 3 RODO) — w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania dokonanego przed cofnięciem.</li>
      </ol>
      <p>
        W celu realizacji powyższych praw prosimy o kontakt: <strong>kontakt@procurea.pl</strong>.
      </p>

      <h2>7. Prawo wniesienia skargi</h2>
      <p>
        W przypadku uznania, że przetwarzanie danych osobowych narusza przepisy RODO, przysługuje Pani/Panu prawo wniesienia skargi do organu nadzorczego:
      </p>
      <p>
        <strong>Prezes Urzędu Ochrony Danych Osobowych</strong><br />
        ul. Stawki 2, 00-193 Warszawa<br />
        www.uodo.gov.pl
      </p>

      <h2>8. Dobrowolność podania danych</h2>
      <p>
        Podanie danych osobowych jest dobrowolne, jednak niezbędne do korzystania z Platformy Procurea. Brak podania danych uniemożliwi rejestrację Konta i korzystanie z usług.
      </p>

      <h2>9. Zautomatyzowane podejmowanie decyzji</h2>
      <p>
        Platforma Procurea wykorzystuje algorytmy AI do wyszukiwania i oceny dostawców. Wyniki generowane przez agentów AI mają charakter wyłącznie informacyjny i wspierający — nie stanowią zautomatyzowanego podejmowania decyzji w rozumieniu art. 22 RODO. Ostateczne decyzje biznesowe zawsze podejmuje Użytkownik.
      </p>

      <h2>10. Środki bezpieczeństwa</h2>
      <p>Administrator wdrożył odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo danych osobowych, w szczególności:</p>
      <ul>
        <li>Szyfrowanie danych w transmisji (TLS) i w spoczynku</li>
        <li>Uwierzytelnianie wieloskładnikowe (OAuth 2.0 + weryfikacja SMS)</li>
        <li>Przechowywanie danych w certyfikowanych centrach danych Google Cloud (region UE)</li>
        <li>Regularne testy bezpieczeństwa i kopie zapasowe</li>
        <li>Kontrola dostępu oparta na zasadzie najniższych uprawnień</li>
        <li>Monitorowanie i logowanie dostępu do danych</li>
      </ul>

      <h2>Dane kontaktowe Administratora</h2>
      <p>
        <strong>Procurea sp. z o.o.</strong><br />
        ul. Pomorska 3/1, 85-050 Bydgoszcz<br />
        E-mail: kontakt@procurea.pl
      </p>
    </LegalLayout>
  )
}
