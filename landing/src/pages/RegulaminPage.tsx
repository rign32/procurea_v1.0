import { LegalLayout } from "@/components/layout/LegalLayout"

export function RegulaminPage() {
  return (
    <LegalLayout title="Regulamin" lastUpdated="18 lutego 2026">
      <h2>§1. Postanowienia ogólne</h2>
      <ol>
        <li>Niniejszy Regulamin określa zasady korzystania z platformy internetowej Procurea, dostępnej pod adresem app.procurea.pl (dalej: „Platforma").</li>
        <li>Właścicielem i operatorem Platformy jest <strong>Procurea sp. z o.o.</strong> z siedzibą w Bydgoszczy, ul. Pomorska 3/1, 85-050 Bydgoszcz, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego, dalej zwana „Usługodawcą".</li>
        <li>Korzystanie z Platformy oznacza akceptację niniejszego Regulaminu.</li>
      </ol>

      <h2>§2. Definicje</h2>
      <ol>
        <li><strong>Platforma</strong> — aplikacja internetowa Procurea umożliwiająca automatyczne wyszukiwanie, analizę i weryfikację dostawców za pomocą agentów AI.</li>
        <li><strong>Użytkownik</strong> — osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, która korzysta z Platformy.</li>
        <li><strong>Konto</strong> — indywidualne konto Użytkownika utworzone w Platformie po rejestracji.</li>
        <li><strong>Kredyt</strong> — jednostka rozliczeniowa uprawniająca do uruchomienia jednego pełnego procesu sourcingu AI w Platformie.</li>
        <li><strong>Proces sourcingu</strong> — wieloetapowy proces wyszukiwania dostawców realizowany przez agentów AI Platformy, obejmujący strategię, skanowanie, analizę, wzbogacanie danych i generowanie wyników.</li>
        <li><strong>Portal dostawcy</strong> — funkcjonalność Platformy umożliwiająca dostawcom składanie ofert bez rejestracji, za pośrednictwem unikalnego linku.</li>
      </ol>

      <h2>§3. Rejestracja i Konto</h2>
      <ol>
        <li>Rejestracja w Platformie odbywa się za pośrednictwem uwierzytelnienia OAuth 2.0 (Google lub Microsoft) oraz weryfikacji numeru telefonu.</li>
        <li>Użytkownik zobowiązany jest podać prawdziwe i aktualne dane podczas rejestracji, w tym informacje o organizacji i stanowisku.</li>
        <li>Każdy Użytkownik może posiadać jedno Konto w Platformie.</li>
        <li>Użytkownik ponosi odpowiedzialność za zachowanie poufności danych dostępowych do swojego Konta.</li>
      </ol>

      <h2>§4. Zakres usług</h2>
      <ol>
        <li>Platforma umożliwia Użytkownikom:
          <ul>
            <li>tworzenie kampanii sourcingowych z wykorzystaniem agentów AI,</li>
            <li>automatyczne wyszukiwanie dostawców w wielu językach i regionach,</li>
            <li>analizę i ocenę dostawców na podstawie dostępnych danych,</li>
            <li>automatyczne wzbogacanie danych kontaktowych dostawców,</li>
            <li>wysyłanie zapytań ofertowych (RFQ) do dostawców,</li>
            <li>korzystanie z portalu dostawcy do zbierania ofert,</li>
            <li>automatyzację sekwencji email i follow-upów,</li>
            <li>eksport wyników i danych.</li>
          </ul>
        </li>
        <li>Usługodawca zastrzega sobie prawo do modyfikacji zakresu funkcjonalności Platformy.</li>
      </ol>

      <h2>§5. Model rozliczeń</h2>
      <ol>
        <li>Platforma działa w modelu pay-as-you-go (płatność za wykorzystanie). Jeden Kredyt uprawnia do uruchomienia jednego procesu sourcingu AI.</li>
        <li>Każdy nowy Użytkownik otrzymuje 3 (trzy) darmowe Kredyty na start.</li>
        <li>Kredyty można nabywać pojedynczo lub w pakietach. Aktualne ceny są dostępne na stronie procurea.pl w sekcji „Cennik".</li>
        <li>Zakupione Kredyty nie podlegają zwrotowi, chyba że proces sourcingu nie został uruchomiony z przyczyn technicznych leżących po stronie Usługodawcy.</li>
        <li>Usługodawca może oferować ceny promocyjne ograniczone czasowo. Informacja o warunkach promocji jest publikowana na stronie internetowej.</li>
      </ol>

      <h2>§6. Odpowiedzialność</h2>
      <ol>
        <li>Usługodawca dokłada wszelkich starań, aby wyniki generowane przez agentów AI były rzetelne i aktualne. Wyniki mają charakter informacyjny i nie stanowią rekomendacji biznesowej.</li>
        <li>Usługodawca nie ponosi odpowiedzialności za:
          <ul>
            <li>decyzje biznesowe podjęte przez Użytkownika na podstawie wyników z Platformy,</li>
            <li>aktualność i poprawność danych dostępnych publicznie w internecie, wykorzystywanych przez agentów AI,</li>
            <li>przerwy w działaniu Platformy wynikające z przyczyn niezależnych od Usługodawcy.</li>
          </ul>
        </li>
        <li>Użytkownik zobowiązuje się korzystać z Platformy zgodnie z obowiązującym prawem i niniejszym Regulaminem.</li>
      </ol>

      <h2>§7. Ochrona danych osobowych</h2>
      <ol>
        <li>Administratorem danych osobowych Użytkowników jest Procurea sp. z o.o. z siedzibą w Bydgoszczy, ul. Pomorska 3/1.</li>
        <li>Szczegółowe informacje dotyczące przetwarzania danych osobowych zawiera <a href="/polityka-prywatnosci">Polityka Prywatności</a> oraz <a href="/rodo">Klauzula informacyjna RODO</a>.</li>
      </ol>

      <h2>§8. Reklamacje</h2>
      <ol>
        <li>Reklamacje dotyczące działania Platformy można zgłaszać drogą elektroniczną na adres: <strong>kontakt@procurea.pl</strong>.</li>
        <li>Usługodawca rozpatruje reklamację w terminie 14 dni roboczych od daty jej otrzymania.</li>
        <li>Reklamacja powinna zawierać: dane Użytkownika, opis problemu oraz oczekiwane rozwiązanie.</li>
      </ol>

      <h2>§9. Rozwiązanie umowy</h2>
      <ol>
        <li>Użytkownik może w każdym momencie usunąć swoje Konto, kontaktując się z Usługodawcą pod adresem kontakt@procurea.pl.</li>
        <li>Usługodawca może zawiesić lub usunąć Konto Użytkownika w przypadku naruszenia niniejszego Regulaminu.</li>
        <li>Usunięcie Konta nie powoduje zwrotu niewykorzystanych Kredytów, z wyjątkiem przypadków opisanych w §5 ust. 4.</li>
      </ol>

      <h2>§10. Postanowienia końcowe</h2>
      <ol>
        <li>Usługodawca zastrzega sobie prawo do zmiany niniejszego Regulaminu. O zmianach Użytkownicy będą informowani drogą elektroniczną z 14-dniowym wyprzedzeniem.</li>
        <li>W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy prawa polskiego.</li>
        <li>Wszelkie spory wynikające z korzystania z Platformy będą rozstrzygane przez sąd właściwy dla siedziby Usługodawcy.</li>
        <li>Niniejszy Regulamin obowiązuje od dnia 18 lutego 2026 r.</li>
      </ol>

      <h2>Dane kontaktowe</h2>
      <p>
        <strong>Procurea sp. z o.o.</strong><br />
        ul. Pomorska 3/1, 85-050 Bydgoszcz<br />
        E-mail: kontakt@procurea.pl
      </p>
    </LegalLayout>
  )
}
