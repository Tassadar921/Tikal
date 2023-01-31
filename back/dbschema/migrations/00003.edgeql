CREATE MIGRATION m1qvmjxrxuvkwzguuq7exxe6cpzdafzlw4ej552q3x2etlspdutd7a
    ONTO m1hgk5c523knwveaqxx52iywczcgfpl47bkupit3q7uyw4m7cmmoeq
{
  ALTER TYPE default::User {
      ALTER PROPERTY email {
          RESET OPTIONALITY;
      };
  };
};
